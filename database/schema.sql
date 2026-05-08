CREATE TABLE IF NOT EXISTS translations (
  locale text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, key)
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  category text NOT NULL,
  image_src text NOT NULL,
  price_usd numeric(10, 2) NOT NULL,
  calories_kcal integer NOT NULL,
  spicy boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_translations (
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale text NOT NULL,
  name text NOT NULL,
  short_name text NOT NULL,
  description text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, locale)
);

CREATE TABLE IF NOT EXISTS promos (
  id text PRIMARY KEY,
  image_src text NOT NULL,
  image_position text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
