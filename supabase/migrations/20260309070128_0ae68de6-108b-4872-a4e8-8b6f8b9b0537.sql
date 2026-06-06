
-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (true);

-- Abandoned carts table
CREATE TABLE public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone text,
  customer_name text,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric NOT NULL DEFAULT 0,
  recovered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage abandoned carts" ON public.abandoned_carts FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert abandoned carts" ON public.abandoned_carts FOR INSERT WITH CHECK (true);
