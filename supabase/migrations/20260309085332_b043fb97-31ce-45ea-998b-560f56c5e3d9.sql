
INSERT INTO public.categories (name, slug, sort_order, is_active, show_in_navbar) VALUES
('হার্বাল চা', 'herbal-tea', 9, true, true),
('ড্রাই ফ্রুটস', 'dry-fruits', 10, true, true),
('বেকারি আইটেম', 'bakery-items', 11, true, true),
('স্কিনকেয়ার', 'skincare', 12, true, true),
('হেলথ ড্রিংকস', 'health-drinks', 13, true, true),
('বেবি ফুড', 'baby-food', 14, true, true),
('গিফট প্যাকেজ', 'gift-package', 15, true, true)
ON CONFLICT (slug) DO NOTHING;
