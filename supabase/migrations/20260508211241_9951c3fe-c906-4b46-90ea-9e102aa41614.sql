-- Shop products table
CREATE TABLE public.shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'consultation',
  delivery_type text NOT NULL DEFAULT 'consultation',
  price integer NOT NULL DEFAULT 0,
  sale_price integer,
  description text,
  duration text,
  file_url text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active products" ON public.shop_products
  FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.shop_products
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.shop_products
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete products" ON public.shop_products
  FOR DELETE USING (true);

CREATE TRIGGER trg_shop_products_updated
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_shop_products_user ON public.shop_products(user_id);
CREATE INDEX idx_shop_products_active ON public.shop_products(is_active);

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.shop_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  kakao_id text,
  question text,
  birthdate text,
  payment_key text,
  order_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  answer text,
  answer_file_url text,
  seller_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read orders" ON public.orders
  FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete orders" ON public.orders
  FOR DELETE USING (true);

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_orders_seller ON public.orders(seller_user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- Toss payments key column on user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS toss_client_key text;