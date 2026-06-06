CREATE DATABASE IF NOT EXISTS organic_shop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE organic_shop;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role ENUM('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_role (user_id, role),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  parent_id CHAR(36) NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  show_in_navbar BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_home BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS brands (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colors (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  hex_code TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sizes (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NULL,
  purchase_price DECIMAL(10,2) NULL,
  sku TEXT,
  stock_quantity INT DEFAULT 0,
  category_id CHAR(36) NULL,
  brand_id CHAR(36) NULL,
  image_url TEXT,
  images JSON NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  weight TEXT,
  unit TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  color_id CHAR(36) NULL,
  size_id CHAR(36) NULL,
  sku TEXT,
  price DECIMAL(10,2) NULL,
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_variants_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL,
  CONSTRAINT fk_variants_size FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_statuses (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(30) DEFAULT '#6b7280',
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  status_id CHAR(36) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  user_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_status FOREIGN KEY (status_id) REFERENCES order_statuses(id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  variant_info TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  email TEXT,
  address TEXT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  user_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id CHAR(36) PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  group_name TEXT DEFAULT 'general',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_charges (
  id CHAR(36) PRIMARY KEY,
  area_name TEXT NOT NULL,
  charge DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banner_categories (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id CHAR(36) PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  redirect_url TEXT,
  category_id CHAR(36) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_banners_category FOREIGN KEY (category_id) REFERENCES banner_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id CHAR(36) PRIMARY KEY,
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_media (
  id CHAR(36) PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracking_pixels (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id CHAR(36) PRIMARY KEY,
  customer_phone TEXT,
  customer_name TEXT,
  customer_email TEXT,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  recovered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  channel VARCHAR(100) DEFAULT 'general',
  budget DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integrations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  config JSON NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('income', 'expense') NOT NULL DEFAULT 'expense',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  note TEXT,
  entry_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO order_statuses (id, name, color, sort_order) VALUES
  (UUID(), 'Pending', '#f59e0b', 1),
  (UUID(), 'Processing', '#3b82f6', 2),
  (UUID(), 'On The Way', '#8b5cf6', 3),
  (UUID(), 'On Hold', '#ef4444', 4),
  (UUID(), 'In Courier', '#06b6d4', 5),
  (UUID(), 'Completed', '#10b981', 6),
  (UUID(), 'Cancelled', '#6b7280', 7);

INSERT IGNORE INTO site_settings (id, `key`, value, group_name) VALUES
  (UUID(), 'site_name', 'Organic Shop', 'general'),
  (UUID(), 'site_logo', '', 'general'),
  (UUID(), 'site_phone', '09647132995', 'general'),
  (UUID(), 'site_email', '', 'general'),
  (UUID(), 'site_address', '', 'general'),
  (UUID(), 'facebook_pixel', '', 'pixels'),
  (UUID(), 'google_tag_manager', '', 'pixels');

DELETE sc1 FROM shipping_charges sc1
JOIN shipping_charges sc2
  ON sc1.area_name = sc2.area_name
 AND sc1.created_at > sc2.created_at;

DROP PROCEDURE IF EXISTS add_shipping_area_unique_key;
DELIMITER //
CREATE PROCEDURE add_shipping_area_unique_key()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'shipping_charges'
      AND index_name = 'unique_shipping_area'
  ) THEN
    ALTER TABLE shipping_charges ADD UNIQUE KEY unique_shipping_area (area_name(191));
  END IF;
END//
DELIMITER ;
CALL add_shipping_area_unique_key();
DROP PROCEDURE add_shipping_area_unique_key;

INSERT INTO shipping_charges (id, area_name, charge) VALUES
  (UUID(), 'Inside Dhaka', 70),
  (UUID(), 'Outside Dhaka', 150)
ON DUPLICATE KEY UPDATE charge = VALUES(charge), is_active = TRUE;

INSERT IGNORE INTO categories (id, name, slug, sort_order, is_active, show_in_navbar) VALUES
  (UUID(), 'Herbal Tea', 'herbal-tea', 9, TRUE, TRUE),
  (UUID(), 'Dry Fruits', 'dry-fruits', 10, TRUE, TRUE),
  (UUID(), 'Bakery Items', 'bakery-items', 11, TRUE, TRUE),
  (UUID(), 'Skincare', 'skincare', 12, TRUE, TRUE),
  (UUID(), 'Health Drinks', 'health-drinks', 13, TRUE, TRUE),
  (UUID(), 'Baby Food', 'baby-food', 14, TRUE, TRUE),
  (UUID(), 'Gift Package', 'gift-package', 15, TRUE, TRUE);
