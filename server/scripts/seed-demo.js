const { pool, id } = require("../db");

const products = [
  ["Pure Ghee (500ml)", "pure-ghee-500ml", 800, 650, "GH001", 24, "ghee-oil"],
  ["Sundarbans Honey (500g)", "sundarbans-honey-500g", 700, 550, "HN001", 18, "organic-honey"],
  ["Cashew Nuts (250g)", "cashew-nuts-250g", 550, 450, "NT001", 8, "nuts-dates"],
  ["Turmeric Powder (200g)", "turmeric-powder-200g", 150, 120, "SP001", 35, "organic-spices"],
  ["Black Seed Oil (100ml)", "black-seed-oil-100ml", 450, 350, "OL001", 12, "organic-oil"],
  ["Miniket Rice (5kg)", "miniket-rice-5kg", 450, 380, "RC001", 40, "rice-pulse"],
  ["Chia Seeds (200g)", "chia-seeds-200g", 350, 280, "SF001", 7, "super-foods"],
  ["Date Molasses (500g)", "date-molasses-500g", 280, 220, "SD001", 20, "sweeteners-dairy"],
  ["Coconut Oil (500ml)", "coconut-oil-500ml", 400, 320, "GH002", 15, "ghee-oil"],
  ["Litchi Honey (1kg)", "litchi-honey-1kg", 1100, 900, "HN002", 6, "organic-honey"],
  ["Ajwa Dates (500g)", "ajwa-dates-500g", 1500, 1200, "NT002", 9, "nuts-dates"],
  ["Mustard Oil (500ml)", "mustard-oil-500ml", 350, 280, "GH003", 30, "ghee-oil"],
];

const customers = [
  ["Rahim Ahmed", "01711000001", "rahim@example.com", "Dhanmondi, Dhaka"],
  ["Nusrat Jahan", "01711000002", "nusrat@example.com", "Uttara, Dhaka"],
  ["Karim Hasan", "01711000003", "karim@example.com", "Chattogram"],
];

async function main() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const brandId = id();
    await connection.query(
      "INSERT INTO brands (id, name, is_active) SELECT ?, 'Organic Shop', TRUE WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Organic Shop')",
      [brandId]
    );
    const [[brand]] = await connection.query("SELECT id FROM brands WHERE name = 'Organic Shop' LIMIT 1");

    for (const [name, slug, basePrice, salePrice, sku, stock, categorySlug] of products) {
      const [[category]] = await connection.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [categorySlug]);
      await connection.query(
        `INSERT INTO products
          (id, name, slug, description, base_price, sale_price, purchase_price, sku, stock_quantity, category_id, brand_id, is_active, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), base_price = VALUES(base_price), sale_price = VALUES(sale_price),
           sku = VALUES(sku), stock_quantity = VALUES(stock_quantity), category_id = VALUES(category_id), brand_id = VALUES(brand_id)`,
        [id(), name, slug, `${name} from Organic Shop.`, basePrice, salePrice, salePrice * 0.7, sku, stock, category?.id || null, brand.id, stock <= 10]
      );
    }

    for (const [name, phone, email, address] of customers) {
      await connection.query(
        `INSERT INTO customers (id, name, phone, email, address, total_orders, total_spent)
         VALUES (?, ?, ?, ?, ?, 0, 0)
         ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), address = VALUES(address)`,
        [id(), name, phone, email, address]
      );
    }

    const [statusRows] = await connection.query("SELECT id, name FROM order_statuses");
    const statusByName = Object.fromEntries(statusRows.map((status) => [status.name, status.id]));
    const [customerRows] = await connection.query("SELECT * FROM customers ORDER BY created_at ASC LIMIT 3");
    const [productRows] = await connection.query("SELECT * FROM products ORDER BY created_at ASC LIMIT 6");
    const statuses = ["Pending", "Processing", "Completed"];

    for (let index = 0; index < 3; index += 1) {
      const orderNumber = `DEMO-100${index + 1}`;
      const customer = customerRows[index];
      const product = productRows[index];
      const quantity = index + 1;
      const subtotal = Number(product.sale_price || product.base_price) * quantity;
      const total = subtotal + 70;
      const orderId = id();

      await connection.query(
        `INSERT IGNORE INTO orders
          (id, order_number, customer_name, customer_phone, customer_email, customer_address, delivery_area,
           status_id, subtotal, delivery_charge, discount, total, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, 'Inside Dhaka', ?, ?, 70, 0, ?, 'cod', ?)`,
        [orderId, orderNumber, customer.name, customer.phone, customer.email, customer.address, statusByName[statuses[index]], subtotal, total, index === 2 ? "paid" : "unpaid"]
      );

      const [[order]] = await connection.query("SELECT id FROM orders WHERE order_number = ? LIMIT 1", [orderNumber]);
      await connection.query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price)
         SELECT ?, ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = ? AND product_id = ?)`,
        [id(), order.id, product.id, product.name, product.image_url, quantity, product.sale_price || product.base_price, order.id, product.id]
      );
      await connection.query(
        "UPDATE customers SET total_orders = (SELECT COUNT(*) FROM orders WHERE customer_phone = ?), total_spent = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_phone = ?) WHERE phone = ?",
        [customer.phone, customer.phone, customer.phone]
      );
    }

    await connection.commit();
    console.log("Demo catalog and dashboard data are ready.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
