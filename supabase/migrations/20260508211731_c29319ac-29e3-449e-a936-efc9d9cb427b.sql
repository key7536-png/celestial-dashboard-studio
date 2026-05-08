ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE public.shop_products DROP CONSTRAINT IF EXISTS shop_products_user_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_seller_user_id_fkey;