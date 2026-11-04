/*
# Create Adam Apparel schema, tracking function, and seed data

Plain-English summary
This migration creates the database tables for the Adam Apparel & Collection website and dashboard, a safe lookup for customers to track their order, and fills everything with the starting data.

1. New Tables
- shop_settings: one row with shop name, tagline, founding year, description, address, WhatsApp number, homepage statistics, and the SPK counter.
- bank_accounts: bank transfer accounts used for the DP payment.
- fabrics: fabric catalog (name, GSM, price add-on per piece, note, photo).
- colors: color palette for the live color switcher (name, code, hex, photo).
- catalog_items: product types (name, icon, base price, minimum order, description, highlights, linked fabrics, photo).
- portfolio_items: past projects (client, garment, quantity, year, photo, note).
- spk_orders: customer production orders with stage, payment flags, customer and item details.
- admin_credentials: salted hash of the admin PIN. Not readable by the website.

2. Functions
- track_spk_order: returns only progress fields for one order when both the SPK number and the last 4 digits of the customer WhatsApp number match.

3. Security
- Row level security is enabled on every table.
- Website visitors can only read shop settings, bank accounts, fabrics, colors, catalog, and portfolio.
- SPK orders cannot be read directly. Customers use track_spk_order only.
- Admin PIN hash is never granted to website roles.
- All writes are reserved for server code (service_role), which checks the admin PIN first.

4. Important notes
- Existing rows are never dropped or overwritten. Seed rows use ON CONFLICT DO NOTHING, so re-running this migration is safe.
- Photo columns start empty; photos are added from the admin dashboard.
- Default admin PIN is 1234 and should be changed from the dashboard after setup.
*/

CREATE TABLE IF NOT EXISTS shop_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  since_year integer NOT NULL,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  wa_number text NOT NULL,
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  spk_counter integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank text NOT NULL,
  account_number text NOT NULL,
  account_owner text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fabrics (
  id text PRIMARY KEY,
  name text NOT NULL,
  gsm integer NOT NULL DEFAULT 0,
  add_on_per_pcs integer NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS colors (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  hex text NOT NULL CHECK (hex ~ '^#[0-9A-Fa-f]{6}$'),
  photo_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon_key text NOT NULL DEFAULT 'shirt' CHECK (icon_key IN ('shirt', 'briefcase', 'award', 'flame', 'trophy', 'layers')),
  base_price integer NOT NULL CHECK (base_price >= 0),
  min_order integer NOT NULL DEFAULT 1 CHECK (min_order >= 1),
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  fabric_ids text[] NOT NULL DEFAULT '{}',
  photo_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id text PRIMARY KEY,
  client text NOT NULL,
  garment text NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 0),
  year integer NOT NULL,
  photo_url text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS spk_orders (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  stage text NOT NULL DEFAULT 'antrean' CHECK (stage IN ('antrean', 'cutting', 'sablon', 'jahit', 'finishing', 'siap')),
  dp_paid boolean NOT NULL DEFAULT false,
  fully_paid boolean NOT NULL DEFAULT false,
  customer jsonb NOT NULL,
  item jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spk_orders_created_at_idx ON spk_orders (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_credentials (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pin_salt text NOT NULL,
  pin_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON shop_settings, bank_accounts, fabrics, colors, catalog_items, portfolio_items TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_shop_settings" ON shop_settings;
CREATE POLICY "public_read_shop_settings" ON shop_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_bank_accounts" ON bank_accounts;
CREATE POLICY "public_read_bank_accounts" ON bank_accounts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_fabrics" ON fabrics;
CREATE POLICY "public_read_fabrics" ON fabrics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_colors" ON colors;
CREATE POLICY "public_read_colors" ON colors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_catalog_items" ON catalog_items;
CREATE POLICY "public_read_catalog_items" ON catalog_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_portfolio_items" ON portfolio_items;
CREATE POLICY "public_read_portfolio_items" ON portfolio_items FOR SELECT
  TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION track_spk_order(p_id text, p_wa_last4 text)
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
    AND p_wa_last4 ~ '^[0-9]{4}$'
    AND right(o.customer->>'wa', 4) = p_wa_last4
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION track_spk_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION track_spk_order(text, text) TO anon, authenticated;

GRANT ALL ON shop_settings, bank_accounts, fabrics, colors, catalog_items, portfolio_items, spk_orders, admin_credentials TO service_role;

INSERT INTO shop_settings (id, shop_name, tagline, since_year, description, address, wa_number, stats, spk_counter)
VALUES (
  1,
  'Adam Apparel & Collection',
  'Solusi Konveksi & Garment Terpercaya',
  2016,
  'Spesialis produksi Kaos Komunitas, Kemeja PDH/PDL Kantor, Polo Bordir Komputer, dan Jaket Angkatan. Jahitan rantai standar ekspor dan garansi bebas cacat.',
  'Jl. Industri Garment No. 21, Kota Bandung, Jawa Barat',
  '6281234567890',
  '[
    {"label": "Tahun Pengalaman Industri Garment", "value": 8, "suffix": "+"},
    {"label": "Komunitas, Kampus & Perusahaan Puas", "value": 450, "suffix": "+"},
    {"label": "Pcs Pakaian Berhasil Diproduksi", "value": 75000, "suffix": "+"},
    {"label": "Garansi Bebas Cacat Jahit & Sablon", "value": 100, "suffix": "%"}
  ]'::jsonb,
  3
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bank_accounts (id, bank, account_number, account_owner, sort_order)
VALUES ('6f1d2c3e-0000-4000-8000-000000000001', 'BCA', '1234567890', 'Adam Apparel', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO admin_credentials (id, pin_salt, pin_hash)
VALUES (
  1,
  'adam-apparel-salt-v1',
  encode(sha256(convert_to('adam-apparel-salt-v1' || ':' || '1234', 'UTF8')), 'hex')
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO fabrics (id, name, gsm, add_on_per_pcs, note, sort_order) VALUES
  ('fab-cotton-24s', 'Cotton Combed 24s', 180, 0, 'Adem, menyerap keringat, tidak luntur', 0),
  ('fab-cotton-30s', 'Cotton Combed 30s', 160, 3000, 'Lebih halus dan ringan', 1),
  ('fab-cvc-pique', 'CVC Lacoste Pique', 220, 8000, 'Tekstur pique untuk polo premium', 2),
  ('fab-american-drill', 'American Drill', 280, 10000, 'Kuat dan rapi untuk seragam dinas', 3),
  ('fab-japan-drill', 'Japan Drill Verlando', 300, 15000, 'Jatuh kain rapi, standar kampus', 4),
  ('fab-fleece-280', 'Cotton Fleece 280 gsm', 280, 25000, 'Tebal, hangat, bulu awet', 5),
  ('fab-fleece-330', 'Cotton Fleece 330 gsm', 330, 35000, 'Paling tebal untuk jaket angkatan', 6),
  ('fab-dryfit-milano', 'Dryfit Milano', 150, 5000, 'Ringan dan cepat kering untuk jersey', 7),
  ('fab-dryfit-sublim', 'Dryfit Sublimasi Full Print', 140, 8000, 'Cocok untuk cetak full print', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO colors (id, name, code, hex, sort_order) VALUES
  ('col-jet-black', 'Jet Black', 'JB-01', '#111827', 0),
  ('col-deep-navy', 'Deep Navy', 'DN-02', '#1e293b', 1),
  ('col-emerald', 'Emerald Bottle Green', 'EB-03', '#064e3b', 2),
  ('col-maroon', 'Crimson Maroon', 'CM-04', '#881337', 3),
  ('col-sage', 'Earth Sage', 'ES-05', '#4b5563', 4),
  ('col-broken-white', 'Broken White', 'BW-06', '#f8fafc', 5),
  ('col-mustard', 'Mustard Gold', 'MG-07', '#b45309', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalog_items (id, name, icon_key, base_price, min_order, description, highlights, fabric_ids, sort_order) VALUES
  ('cat-kaos', 'Kaos Custom', 'shirt', 85000, 12, 'Kaos komunitas dengan cotton combed yang adem dan nyaman dipakai seharian.', ARRAY['Jahitan rantai standar distro', 'Sablon plastisol dan DTF high-density', 'Tidak mudah luntur'], ARRAY['fab-cotton-24s', 'fab-cotton-30s'], 0),
  ('cat-pdh', 'Kemeja PDH/PDL', 'briefcase', 150000, 12, 'Seragam kantor dan kampus dari American Drill atau Japan Drill Verlando.', ARRAY['Kain kuat dan rapi', 'Pola standar dinas', 'Bordir logo dan nama'], ARRAY['fab-american-drill', 'fab-japan-drill'], 1),
  ('cat-polo', 'Polo Shirt', 'award', 120000, 12, 'Polo CVC Lacoste pique dengan bordir komputer yang tajam dan presisi.', ARRAY['Bahan CVC Lacoste Pique', 'Bordir komputer tajam', 'Kerah tidak melar'], ARRAY['fab-cvc-pique', 'fab-cotton-30s'], 2),
  ('cat-hoodie', 'Hoodie & Zipper', 'flame', 185000, 12, 'Cotton fleece tebal 280-330 gsm yang hangat, seratnya halus, dan bulunya awet.', ARRAY['Fleece 280-330 gsm', 'Hangat dan halus', 'Bulu tetap awet'], ARRAY['fab-fleece-280', 'fab-fleece-330'], 3),
  ('cat-jersey', 'Jersey Sport', 'trophy', 135000, 12, 'Jersey olahraga dengan Dryfit Milano atau sublimasi full print.', ARRAY['Dryfit ringan dan cepat kering', 'Sublimasi full print', 'Nomor dan nama presisi'], ARRAY['fab-dryfit-milano', 'fab-dryfit-sublim'], 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_items (id, client, garment, quantity, year, photo_url, note, sort_order) VALUES
  ('port-1', 'Komunitas Pemuda Sehat Bandung', 'Kaos Komunitas', 350, 2025, 'https://images.pexels.com/photos/27893029/pexels-photo-27893029.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sablon plastisol 2 warna, selesai tepat waktu.', 0),
  ('port-2', 'PT Maju Bersama Logistik', 'Kemeja PDH/PDL', 240, 2025, 'https://images.pexels.com/photos/31251577/pexels-photo-31251577.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Seragam lapangan American Drill dengan bordir logo.', 1),
  ('port-3', 'Angkatan 2016 SMA Negeri 3', 'Hoodie Angkatan', 120, 2024, 'https://images.pexels.com/photos/11176397/pexels-photo-11176397.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Fleece 330 gsm dengan bordir punggung.', 2)
ON CONFLICT (id) DO NOTHING;
