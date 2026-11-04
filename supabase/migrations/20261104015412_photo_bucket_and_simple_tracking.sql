/*
# Photo storage bucket and simpler SPK tracking

Plain-English summary
1. Creates a public photo bucket where product, fabric, color, and portfolio photos are stored when uploaded from the admin dashboard.
2. Changes the tracking lookup so customers only need their SPK number. The lookup returns progress details only, never customer names, phone numbers, or addresses.

1. Storage
- New public bucket "product-photos". Files are readable by anyone with the link. Uploads are only performed by server code (service role), so visitors cannot upload.
- Maximum file size 2 MB; only JPEG, PNG, and WebP are accepted.

2. Functions
- track_spk_order now takes only the SPK number. The old two-argument version is removed and replaced.

3. Security
- Customer names, phone numbers, and addresses are never returned by the tracking lookup.

4. Important notes
- Re-running this migration is safe: the bucket insert uses ON CONFLICT DO NOTHING, and the function is recreated.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-photos', 'product-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP FUNCTION IF EXISTS track_spk_order(text, text);

CREATE OR REPLACE FUNCTION track_spk_order(p_id text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', o.id,
    'stage', o.stage,
    'createdAt', o.created_at,
    'deadline', o.customer->>'deadline',
    'productName', o.item->>'productName',
    'totalPcs', (o.item->>'totalPcs')::integer,
    'dpPaid', o.dp_paid,
    'fullyPaid', o.fully_paid
  )
  FROM spk_orders o
  WHERE o.id = p_id
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION track_spk_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION track_spk_order(text) TO anon, authenticated;
