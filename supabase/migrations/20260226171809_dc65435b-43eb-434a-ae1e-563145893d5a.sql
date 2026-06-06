
-- 1. App roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- 2. User roles table (CRITICAL: separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
$$;

-- 4. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 6. Brands
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 7. Colors
CREATE TABLE public.colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

-- 8. Sizes
CREATE TABLE public.sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

-- 9. Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2),
  sku TEXT,
  stock_quantity INT DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  weight TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 10. Product variants
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  color_id UUID REFERENCES public.colors(id) ON DELETE SET NULL,
  size_id UUID REFERENCES public.sizes(id) ON DELETE SET NULL,
  sku TEXT,
  price DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 11. Order statuses
CREATE TABLE public.order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6b7280',
  sort_order INT DEFAULT 0
);
ALTER TABLE public.order_statuses ENABLE ROW LEVEL SECURITY;

-- Insert default statuses
INSERT INTO public.order_statuses (name, color, sort_order) VALUES
  ('Pending', '#f59e0b', 1),
  ('Processing', '#3b82f6', 2),
  ('On The Way', '#8b5cf6', 3),
  ('On Hold', '#ef4444', 4),
  ('In Courier', '#06b6d4', 5),
  ('Completed', '#10b981', 6),
  ('Cancelled', '#6b7280', 7);

-- 12. Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  status_id UUID REFERENCES public.order_statuses(id) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 13. Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  variant_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 14. Customers (from orders)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  address TEXT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 15. Site settings (key-value)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  group_name TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 16. Shipping charges
CREATE TABLE public.shipping_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT NOT NULL,
  charge DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shipping_charges ENABLE ROW LEVEL SECURITY;

-- 17. Banners
CREATE TABLE public.banner_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banner_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  redirect_url TEXT,
  category_id UUID REFERENCES public.banner_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 18. Pages
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 19. Social media
CREATE TABLE public.social_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_media ENABLE ROW LEVEL SECURITY;

-- 20. Pixels & GTM
CREATE TABLE public.tracking_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'facebook', 'google', 'tiktok', etc
  pixel_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tracking_pixels ENABLE ROW LEVEL SECURITY;

-- 21. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== RLS POLICIES =====================

-- user_roles: only admins can read
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- categories: public read, admin write
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin());

-- brands
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL TO authenticated USING (public.is_admin());

-- colors
CREATE POLICY "Anyone can view colors" ON public.colors FOR SELECT USING (true);
CREATE POLICY "Admins can manage colors" ON public.colors FOR ALL TO authenticated USING (public.is_admin());

-- sizes
CREATE POLICY "Anyone can view sizes" ON public.sizes FOR SELECT USING (true);
CREATE POLICY "Admins can manage sizes" ON public.sizes FOR ALL TO authenticated USING (public.is_admin());

-- products
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.is_admin());

-- product_variants
CREATE POLICY "Anyone can view variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.is_admin());

-- order_statuses
CREATE POLICY "Anyone can view statuses" ON public.order_statuses FOR SELECT USING (true);
CREATE POLICY "Admins can manage statuses" ON public.order_statuses FOR ALL TO authenticated USING (public.is_admin());

-- orders: customers see own, admins see all
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin());

-- order_items
CREATE POLICY "View order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.is_admin());

-- customers
CREATE POLICY "Admins can view customers" ON public.customers FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (public.is_admin());

-- site_settings
CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin());

-- shipping_charges
CREATE POLICY "Anyone can view shipping" ON public.shipping_charges FOR SELECT USING (true);
CREATE POLICY "Admins can manage shipping" ON public.shipping_charges FOR ALL TO authenticated USING (public.is_admin());

-- banner_categories
CREATE POLICY "Anyone can view banner cats" ON public.banner_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage banner cats" ON public.banner_categories FOR ALL TO authenticated USING (public.is_admin());

-- banners
CREATE POLICY "Anyone can view banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL TO authenticated USING (public.is_admin());

-- pages
CREATE POLICY "Anyone can view pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL TO authenticated USING (public.is_admin());

-- social_media
CREATE POLICY "Anyone can view social" ON public.social_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage social" ON public.social_media FOR ALL TO authenticated USING (public.is_admin());

-- tracking_pixels
CREATE POLICY "Admins can view pixels" ON public.tracking_pixels FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage pixels" ON public.tracking_pixels FOR ALL TO authenticated USING (public.is_admin());

-- Insert default site settings
INSERT INTO public.site_settings (key, value, group_name) VALUES
  ('site_name', 'অর্গানিক শপ', 'general'),
  ('site_logo', '', 'general'),
  ('site_phone', '09647132995', 'general'),
  ('site_email', '', 'general'),
  ('site_address', '', 'general'),
  ('facebook_pixel', '', 'pixels'),
  ('google_tag_manager', '', 'pixels');

-- Insert default shipping charges
INSERT INTO public.shipping_charges (area_name, charge) VALUES
  ('ঢাকার ভিতরে', 70),
  ('ঢাকার বাইরে', 150);
