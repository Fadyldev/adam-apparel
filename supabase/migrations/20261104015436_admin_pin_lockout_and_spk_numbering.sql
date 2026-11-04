/*
# Admin PIN lockout and atomic SPK numbering

Plain-English summary
1. Protects the admin PIN from guessing. After 5 wrong PIN attempts, the admin login is locked for 15 minutes.
2. Adds a safe way to give each new SPK the next number in one step, so two customers submitting at the same moment never receive the same SPK number.

1. New Columns
- admin_credentials.failed_attempts: count of wrong PIN attempts since the last correct one.
- admin_credentials.locked_until: time until which PIN checks are refused.

2. Functions
- next_spk_number: increases the shop SPK counter by one and returns the new number. Only server code can call it.

3. Security
- Neither new function is callable by website visitors.

4. Important notes
- Existing data is untouched. Columns are added only if missing, so re-running is safe.
*/

ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS locked_until timestamptz;

CREATE OR REPLACE FUNCTION next_spk_number()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE shop_settings
  SET spk_counter = spk_counter + 1, updated_at = now()
  WHERE id = 1
  RETURNING spk_counter
$$;

REVOKE EXECUTE ON FUNCTION next_spk_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION next_spk_number() TO service_role;
