const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { pool, id } = require("./db");
const { verifyPassword } = require("./password");
require("dotenv").config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10mb" }));

const tokens = new Map();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const resources = {
  users: {
    table: "users",
    orderBy: "created_at",
    fields: ["email", "phone", "full_name", "is_active"],
  },
  customers: {
    table: "customers",
    orderBy: "created_at",
    fields: ["name", "phone", "email", "address", "total_orders", "total_spent"],
  },
  orders: {
    table: "orders",
    orderBy: "created_at",
    fields: ["order_number", "customer_name", "customer_phone", "customer_email", "customer_address", "delivery_area", "subtotal", "delivery_charge", "discount", "total", "payment_method", "payment_status", "notes"],
  },
  products: {
    table: "products",
    orderBy: "created_at",
    fields: ["name", "slug", "description", "short_description", "base_price", "sale_price", "purchase_price", "sku", "stock_quantity", "image_url", "images", "is_active", "is_featured", "weight", "unit"],
  },
  categories: {
    table: "categories",
    orderBy: "sort_order",
    fields: ["name", "slug", "image_url", "parent_id", "sort_order", "is_active", "show_in_navbar", "show_on_home"],
  },
  brands: {
    table: "brands",
    orderBy: "created_at",
    fields: ["name", "logo_url", "is_active"],
  },
  colors: {
    table: "colors",
    orderBy: "created_at",
    fields: ["name", "hex_code"],
  },
  sizes: {
    table: "sizes",
    orderBy: "created_at",
    fields: ["name", "value"],
  },
  coupons: {
    table: "coupons",
    orderBy: "created_at",
    fields: ["code", "discount_type", "discount_value", "min_order_amount", "max_uses", "used_count", "is_active", "expires_at"],
  },
  campaigns: {
    table: "campaigns",
    orderBy: "created_at",
    fields: ["name", "channel", "budget", "is_active"],
  },
  reviews: {
    table: "reviews",
    orderBy: "created_at",
    fields: ["customer_name", "rating", "comment", "is_active"],
  },
  videos: {
    table: "videos",
    orderBy: "sort_order",
    fields: ["title", "video_url", "thumbnail_url", "is_active", "sort_order"],
  },
  blogs: {
    table: "blogs",
    orderBy: "created_at",
    fields: ["title", "slug", "excerpt", "content", "image_url", "is_active"],
  },
  pages: {
    table: "pages",
    orderBy: "created_at",
    fields: ["title", "slug", "content", "is_active"],
  },
  social_media: {
    table: "social_media",
    orderBy: "sort_order",
    fields: ["platform", "url", "icon", "is_active", "sort_order"],
  },
  order_statuses: {
    table: "order_statuses",
    orderBy: "sort_order",
    fields: ["name", "color", "sort_order"],
  },
  site_settings: {
    table: "site_settings",
    orderBy: "created_at",
    fields: ["key", "value", "group_name"],
  },
  banner_categories: {
    table: "banner_categories",
    orderBy: "created_at",
    fields: ["name", "slug"],
  },
  banners: {
    table: "banners",
    orderBy: "sort_order",
    fields: ["title", "image_url", "redirect_url", "category_id", "is_active", "sort_order"],
  },
  tracking_pixels: {
    table: "tracking_pixels",
    orderBy: "created_at",
    fields: ["name", "type", "pixel_id", "is_active"],
  },
  integrations: {
    table: "integrations",
    orderBy: "created_at",
    fields: ["name", "type", "api_key", "api_secret", "config", "is_active"],
  },
  accounts: {
    table: "accounts",
    orderBy: "created_at",
    fields: ["title", "type", "amount", "note", "entry_date"],
  },
  shipping_charges: {
    table: "shipping_charges",
    orderBy: "created_at",
    fields: ["area_name", "charge", "is_active"],
  },
};

function pickPayload(resource, body) {
  const payload = {};
  for (const field of resource.fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      if (field === "config" && body[field] && typeof body[field] === "object") {
        payload[field] = JSON.stringify(body[field]);
      } else {
        payload[field] = body[field] === "" ? null : body[field];
      }
    }
  }
  return payload;
}

async function getIntegration(type) {
  const [rows] = await pool.query(
    "SELECT * FROM integrations WHERE type = ? AND is_active = TRUE ORDER BY updated_at DESC, created_at DESC LIMIT 1",
    [type]
  );
  const row = rows[0];
  if (!row) return null;

  if (typeof row.config === "string") {
    try {
      row.config = JSON.parse(row.config);
    } catch {
      row.config = {};
    }
  }

  return row;
}

app.get("/", (_req, res) => {
  res.json({
    message: "Organic Shop MySQL API is running",
    database_test: "http://localhost:5000/api/test-db",
    products: "http://localhost:5000/api/products",
    categories: "http://localhost:5000/api/categories",
  });
});

function publicUser(user, roles = []) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    full_name: user.full_name,
    roles,
    is_admin: roles.includes("admin") || roles.includes("super_admin"),
  };
}

async function getRoles(userId) {
  const [roles] = await pool.query("SELECT role FROM user_roles WHERE user_id = ?", [userId]);
  return roles.map((row) => row.role);
}

async function getSupabaseAdmin(token) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${token}`,
  };

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();

  const roleResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!roleResponse.ok || !(await roleResponse.json())) return null;

  return user;
}

async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const userId = token ? tokens.get(token) : null;

  if (userId) {
    const roles = await getRoles(userId);
    if (!roles.includes("admin") && !roles.includes("super_admin")) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    req.userId = userId;
    req.roles = roles;
    next();
    return;
  }

  try {
    const supabaseUser = token ? await getSupabaseAdmin(token) : null;
    if (!supabaseUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.userId = supabaseUser.id;
    req.roles = ["admin"];
    req.supabaseUser = supabaseUser;
    next();
  } catch (error) {
    console.error("Supabase admin verification failed:", error.message);
    res.status(503).json({ error: "Could not verify admin session" });
    return;
  }
}

app.get("/api/test-db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1", [email]);
  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ error: "Invalid login" });
    return;
  }

  const roles = await getRoles(user.id);
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, user.id);

  res.json({ token, user: publicUser(user, roles) });
});

app.get("/api/admin/me", requireAdmin, async (req, res) => {
  if (req.supabaseUser) {
    const user = req.supabaseUser;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.user_metadata?.full_name || null,
        roles: req.roles,
        is_admin: true,
      },
    });
    return;
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.userId]);
  res.json({ user: publicUser(rows[0], req.roles) });
});

app.get("/api/admin/dashboard", requireAdmin, async (_req, res) => {
  const [[orders]] = await pool.query("SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM orders");
  const [[products]] = await pool.query("SELECT COUNT(*) AS count FROM products");
  const [[customers]] = await pool.query("SELECT COUNT(*) AS count FROM customers");
  const [statusRows] = await pool.query(
    `SELECT order_statuses.name, COUNT(orders.id) AS count
     FROM order_statuses
     LEFT JOIN orders ON orders.status_id = order_statuses.id
     GROUP BY order_statuses.id, order_statuses.name`
  );
  const [topProducts] = await pool.query(
    `SELECT product_name AS name, product_image AS image_url, SUM(quantity) AS sold, SUM(quantity * price) AS revenue
     FROM order_items
     GROUP BY product_name, product_image
     ORDER BY sold DESC
     LIMIT 5`
  );
  const [inventoryAlerts] = await pool.query(
    `SELECT id, name, image_url, stock_quantity
     FROM products
     WHERE stock_quantity <= 10
     ORDER BY stock_quantity ASC, name ASC
     LIMIT 8`
  );
  const [recentOrders] = await pool.query(
    `SELECT orders.id, orders.order_number, orders.customer_name, orders.total, orders.created_at,
            order_statuses.name AS status_name, order_statuses.color AS status_color
     FROM orders
     JOIN order_statuses ON orders.status_id = order_statuses.id
     ORDER BY orders.created_at DESC
     LIMIT 8`
  );

  const statusCount = Object.fromEntries(statusRows.map((row) => [row.name, Number(row.count)]));

  res.json({
    total_orders: Number(orders.count),
    total_revenue: Number(orders.total),
    total_products: Number(products.count),
    total_customers: Number(customers.count),
    pending_orders: statusCount.Pending || 0,
    completed_orders: statusCount.Completed || 0,
    in_courier_orders: statusCount["In Courier"] || 0,
    cancelled_orders: statusCount.Cancelled || 0,
    top_products: topProducts,
    inventory_alerts: inventoryAlerts,
    recent_orders: recentOrders,
  });
});

app.get("/api/products", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT products.*, categories.name AS category_name, categories.slug AS category_slug,
            brands.name AS brand_name
     FROM products
     LEFT JOIN categories ON products.category_id = categories.id
     LEFT JOIN brands ON products.brand_id = brands.id
     WHERE products.is_active = TRUE
     ORDER BY products.created_at DESC`
  );
  res.json(rows);
});

app.get("/api/categories", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order, name");
  res.json(rows);
});

app.get("/api/public/products", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT products.*, categories.name AS category_name, categories.slug AS category_slug,
            brands.name AS brand_name
     FROM products
     LEFT JOIN categories ON products.category_id = categories.id
     LEFT JOIN brands ON products.brand_id = brands.id
     WHERE products.is_active = TRUE
     ORDER BY products.created_at DESC`
  );
  res.json(rows);
});

app.get("/api/public/products/:slug", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT products.*, categories.name AS category_name, categories.slug AS category_slug,
            brands.name AS brand_name
     FROM products
     LEFT JOIN categories ON products.category_id = categories.id
     LEFT JOIN brands ON products.brand_id = brands.id
     WHERE products.slug = ? AND products.is_active = TRUE
     LIMIT 1`,
    [req.params.slug]
  );

  if (!rows[0]) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [variants] = await pool.query(
    `SELECT product_variants.id, product_variants.price, product_variants.stock_quantity,
            sizes.name AS size_name, sizes.value AS size_value
     FROM product_variants
     LEFT JOIN sizes ON product_variants.size_id = sizes.id
     WHERE product_variants.product_id = ? AND product_variants.is_active = TRUE
     ORDER BY product_variants.created_at ASC`,
    [rows[0].id]
  );

  res.json({ product: rows[0], variants });
});

app.get("/api/public/categories", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order, name");
  res.json(rows);
});

app.get("/api/public/categories/:slug", async (req, res) => {
  const [categoryRows] = await pool.query("SELECT * FROM categories WHERE slug = ? AND is_active = TRUE LIMIT 1", [req.params.slug]);
  const category = categoryRows[0];

  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [subCategories] = await pool.query("SELECT * FROM categories WHERE parent_id = ? AND is_active = TRUE ORDER BY sort_order, name", [category.id]);
  const categoryIds = [category.id, ...subCategories.map((row) => row.id)];
  const [products] = await pool.query(
    `SELECT products.*, categories.name AS category_name, categories.slug AS category_slug,
            brands.name AS brand_name
     FROM products
     LEFT JOIN categories ON products.category_id = categories.id
     LEFT JOIN brands ON products.brand_id = brands.id
     WHERE products.is_active = TRUE AND products.category_id IN (${categoryIds.map(() => "?").join(",")})
     ORDER BY products.created_at DESC`,
    categoryIds
  );

  res.json({ category, subCategories, products });
});

app.get("/api/public/shipping", async (_req, res) => {
  const [rows] = await pool.query("SELECT area_name, charge FROM shipping_charges WHERE is_active = TRUE ORDER BY created_at ASC");
  res.json(rows);
});

app.post("/api/public/orders", async (req, res) => {
  const { customer, area, payment_method, items = [], subtotal = 0, delivery_charge = 0 } = req.body || {};

  if (!customer?.name || !customer?.phone || !customer?.address || !area || !items.length) {
    res.status(400).json({ error: "Customer, delivery area, and order items are required" });
    return;
  }

  const [[pendingStatus]] = await pool.query("SELECT id FROM order_statuses WHERE name = 'Pending' LIMIT 1");
  if (!pendingStatus) {
    res.status(500).json({ error: "Pending order status is missing" });
    return;
  }

  const connection = await pool.getConnection();
  const orderId = id();
  const orderNumber = `ORD-${Date.now()}`;
  const total = Number(subtotal) + Number(delivery_charge);

  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO orders
        (id, order_number, customer_name, customer_phone, customer_email, customer_address, delivery_area,
         status_id, subtotal, delivery_charge, total, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid')`,
      [
        orderId,
        orderNumber,
        customer.name,
        customer.phone,
        customer.email || null,
        customer.address,
        area,
        pendingStatus.id,
        subtotal,
        delivery_charge,
        total,
        payment_method || "cod",
      ]
    );

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items
          (id, order_id, product_id, product_name, product_image, quantity, price, variant_info)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id(),
          orderId,
          item.product_id || null,
          item.product_name,
          item.product_image || null,
          item.quantity || 1,
          item.price || 0,
          item.variant_info || null,
        ]
      );
    }

    const [[existingCustomer]] = await connection.query("SELECT id, total_orders, total_spent FROM customers WHERE phone = ? LIMIT 1", [customer.phone]);
    if (existingCustomer) {
      await connection.query(
        "UPDATE customers SET name = ?, email = ?, address = ?, total_orders = ?, total_spent = ? WHERE id = ?",
        [
          customer.name,
          customer.email || null,
          customer.address,
          Number(existingCustomer.total_orders || 0) + 1,
          Number(existingCustomer.total_spent || 0) + total,
          existingCustomer.id,
        ]
      );
    } else {
      await connection.query(
        "INSERT INTO customers (id, name, phone, email, address, total_orders, total_spent) VALUES (?, ?, ?, ?, ?, 1, ?)",
        [id(), customer.name, customer.phone, customer.email || null, customer.address, total]
      );
    }

    await connection.commit();
    res.status(201).json({ id: orderId, order_number: orderNumber });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT orders.*, order_statuses.name AS status_name, order_statuses.color AS status_color FROM orders JOIN order_statuses ON orders.status_id = order_statuses.id ORDER BY orders.created_at DESC"
  );
  res.json(rows);
});

app.get("/api/admin/order-statuses", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM order_statuses ORDER BY sort_order ASC, name ASC");
  res.json(rows);
});

app.get("/api/admin/orders/:id/items", requireAdmin, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC", [req.params.id]);
  res.json(rows);
});

app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const { status_id } = req.body || {};
  if (!status_id) {
    res.status(400).json({ error: "Status is required" });
    return;
  }

  await pool.query("UPDATE orders SET status_id = ? WHERE id = ?", [status_id, req.params.id]);
  res.json({ success: true });
});

app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM order_items WHERE order_id = ?", [req.params.id]);
    await connection.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Update order details (edit)
app.put("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const {
    customer_name, customer_phone, customer_email,
    customer_address, delivery_area, notes,
    payment_method, payment_status, discount,
  } = req.body || {};

  const fields = [];
  const values = [];
  if (customer_name !== undefined) { fields.push("customer_name = ?"); values.push(customer_name); }
  if (customer_phone !== undefined) { fields.push("customer_phone = ?"); values.push(customer_phone); }
  if (customer_email !== undefined) { fields.push("customer_email = ?"); values.push(customer_email || null); }
  if (customer_address !== undefined) { fields.push("customer_address = ?"); values.push(customer_address); }
  if (delivery_area !== undefined) { fields.push("delivery_area = ?"); values.push(delivery_area); }
  if (notes !== undefined) { fields.push("notes = ?"); values.push(notes || null); }
  if (payment_method !== undefined) { fields.push("payment_method = ?"); values.push(payment_method); }
  if (payment_status !== undefined) { fields.push("payment_status = ?"); values.push(payment_status); }
  if (discount !== undefined) {
    fields.push("discount = ?");
    values.push(Number(discount) || 0);
  }

  if (!fields.length) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(req.params.id);
  await pool.query(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`, values);

  // Recalculate total if discount changed
  if (discount !== undefined) {
    const [[order]] = await pool.query("SELECT subtotal, delivery_charge, discount FROM orders WHERE id = ? LIMIT 1", [req.params.id]);
    if (order) {
      const newTotal = Number(order.subtotal) + Number(order.delivery_charge) - Number(order.discount);
      await pool.query("UPDATE orders SET total = ? WHERE id = ?", [newTotal, req.params.id]);
    }
  }

  res.json({ success: true });
});

// Steadfast courier dispatch
app.post("/api/admin/courier/steadfast", requireAdmin, async (req, res) => {
  const integration = await getIntegration("steadfast");
  const config = integration?.config || {};
  const { order_id, recipient_name, recipient_phone, recipient_address, cod_amount, note } = req.body || {};
  const api_key = req.body?.api_key || integration?.api_key;
  const api_secret = req.body?.api_secret || integration?.api_secret;
  const baseUrl = (req.body?.base_url || config.base_url || "https://portal.steadfast.com.bd/api/v1").replace(/\/$/, "");

  if (!api_key || !api_secret) {
    res.status(400).json({ error: "Steadfast API Key এবং Secret Key দরকার। API Integration > Steadfast Courier থেকে কনফিগার করুন।" });
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/create_order`, {
      method: "POST",
      headers: {
        "Api-Key": api_key,
        "Secret-Key": api_secret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice: req.body.invoice || `ORD-${Date.now()}`,
        recipient_name,
        recipient_phone,
        recipient_address,
        cod_amount: Number(cod_amount) || 0,
        note: note || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.message || "Steadfast API error" });
      return;
    }

    // Save tracking number
    if (order_id && data.consignment?.tracking_code) {
      await pool.query(
        "UPDATE orders SET notes = CONCAT(COALESCE(notes,''), ?) WHERE id = ?",
        [`\n[Steadfast: ${data.consignment.tracking_code}]`, order_id]
      ).catch(() => {});
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/courier/redx", requireAdmin, async (req, res) => {
  const integration = await getIntegration("redx");
  const config = integration?.config || {};
  const token = req.body?.access_token || integration?.api_key;
  const baseUrl = (req.body?.base_url || config.base_url || "https://openapi.redx.com.bd/v1.0.0-beta").replace(/\/$/, "");

  if (!token) {
    res.status(400).json({ error: "RedX Access Token is required. Configure API Integration > RedX Courier." });
    return;
  }

  const payload = {
    customer_name: req.body?.recipient_name,
    customer_phone: req.body?.recipient_phone,
    delivery_area: req.body?.delivery_area,
    delivery_area_id: Number(req.body?.delivery_area_id || config.default_area_id || 0),
    customer_address: req.body?.recipient_address,
    merchant_invoice_id: req.body?.invoice || `ORD-${Date.now()}`,
    cash_collection_amount: Number(req.body?.cod_amount || 0),
    parcel_weight: Number(req.body?.parcel_weight || config.parcel_weight || 500),
    instruction: req.body?.note || "",
    value: Number(req.body?.value || req.body?.cod_amount || 0),
    is_closed_box: req.body?.is_closed_box ?? true,
    pickup_store_id: Number(req.body?.pickup_store_id || config.pickup_store_id || 0),
  };

  try {
    const response = await fetch(`${baseUrl}/parcel`, {
      method: "POST",
      headers: {
        "API-ACCESS-TOKEN": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.message || "RedX API error", data });
      return;
    }

    if (req.body?.order_id && data.tracking_id) {
      await pool.query(
        "UPDATE orders SET notes = CONCAT(COALESCE(notes,''), ?) WHERE id = ?",
        [`\n[RedX: ${data.tracking_id}]`, req.body.order_id]
      ).catch(() => {});
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/courier/pathao", requireAdmin, async (req, res) => {
  const integration = await getIntegration("pathao");
  const config = integration?.config || {};
  const clientId = req.body?.client_id || integration?.api_key;
  const clientSecret = req.body?.client_secret || integration?.api_secret;
  const username = req.body?.username || config.username;
  const password = req.body?.password || config.password;
  const baseUrl = (req.body?.base_url || config.base_url || "https://api-hermes.pathao.com").replace(/\/$/, "");

  if (!clientId || !clientSecret || !username || !password || !config.store_id) {
    res.status(400).json({ error: "Pathao client credentials, merchant login, and Store ID are required. Configure API Integration > Pathao Courier." });
    return;
  }

  try {
    const tokenResponse = await fetch(`${baseUrl}/aladdin/api/v1/issue-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
        grant_type: "password",
      }),
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      res.status(tokenResponse.status || 400).json({ error: tokenData.message || "Pathao token request failed", data: tokenData });
      return;
    }

    const orderPayload = {
      store_id: Number(req.body?.store_id || config.store_id),
      merchant_order_id: req.body?.invoice || `ORD-${Date.now()}`,
      recipient_name: req.body?.recipient_name,
      recipient_phone: req.body?.recipient_phone,
      recipient_address: req.body?.recipient_address,
      recipient_city: Number(req.body?.recipient_city || config.city_id || 1),
      recipient_zone: Number(req.body?.recipient_zone || config.zone_id || 1),
      recipient_area: Number(req.body?.recipient_area || config.area_id || 1),
      delivery_type: Number(req.body?.delivery_type || 48),
      item_type: Number(req.body?.item_type || 2),
      special_instruction: req.body?.note || "",
      item_quantity: Number(req.body?.item_quantity || 1),
      item_weight: Number(req.body?.item_weight || 0.5),
      amount_to_collect: Number(req.body?.cod_amount || 0),
      item_description: req.body?.item_description || "Order parcel",
    };

    const orderResponse = await fetch(`${baseUrl}/aladdin/api/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderPayload),
    });
    const data = await orderResponse.json();

    if (!orderResponse.ok) {
      res.status(orderResponse.status).json({ error: data.message || "Pathao API error", data });
      return;
    }

    const consignmentId = data.data?.consignment_id || data.consignment_id;
    if (req.body?.order_id && consignmentId) {
      await pool.query(
        "UPDATE orders SET notes = CONCAT(COALESCE(notes,''), ?) WHERE id = ?",
        [`\n[Pathao: ${consignmentId}]`, req.body.order_id]
      ).catch(() => {});
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/reports/sales", requireAdmin, async (_req, res) => {
  const [items] = await pool.query(
    `SELECT order_items.id, order_items.order_id, order_items.product_id, order_items.product_name,
            order_items.quantity, order_items.price, order_items.created_at,
            orders.order_number, orders.customer_name, orders.customer_phone, orders.created_at AS order_created_at,
            products.purchase_price, products.base_price
     FROM order_items
     JOIN orders ON orders.id = order_items.order_id
     LEFT JOIN products ON products.id = order_items.product_id
     ORDER BY orders.created_at DESC, order_items.created_at DESC`
  );
  res.json(items);
});

app.get("/api/admin/reports/stock", requireAdmin, async (_req, res) => {
  const [products] = await pool.query(
    `SELECT products.id, products.name, products.slug, products.image_url, products.sku,
            products.stock_quantity, products.base_price, products.sale_price, products.purchase_price, products.is_featured,
            products.is_active, categories.name AS category_name
     FROM products
     LEFT JOIN categories ON categories.id = products.category_id
     ORDER BY products.name ASC`
  );
  res.json(products);
});

app.get("/api/admin/reports/customer-analytics", requireAdmin, async (_req, res) => {
  const [[customers]] = await pool.query("SELECT COUNT(*) AS count FROM customers");
  const [[products]] = await pool.query("SELECT COUNT(*) AS count FROM products");
  const [[carts]] = await pool.query("SELECT COUNT(*) AS count FROM abandoned_carts");
  const [[orders]] = await pool.query("SELECT COUNT(*) AS count FROM orders");
  const [topProducts] = await pool.query(
    `SELECT product_name AS name, product_image AS image_url, COUNT(*) AS views, COALESCE(SUM(quantity), 0) AS cart_count
     FROM order_items
     GROUP BY product_name, product_image
     ORDER BY views DESC, cart_count DESC
     LIMIT 10`
  );

  const visitors = Number(customers.count);
  const pageViews = Math.max(Number(products.count), visitors);
  const productViews = topProducts.reduce((sum, product) => sum + Number(product.views || 0), 0);
  const cartAdds = Number(carts.count);
  const orderCount = Number(orders.count);

  res.json({
    visitors,
    page_views: pageViews,
    product_views: productViews,
    cart_adds: cartAdds,
    orders: orderCount,
    top_products: topProducts,
  });
});

app.get("/api/admin/resources/:resource", requireAdmin, async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const [rows] = await pool.query(`SELECT * FROM ${resource.table} ORDER BY ${resource.orderBy} DESC`);
  res.json(rows);
});

app.post("/api/admin/resources/:resource", requireAdmin, async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const payload = pickPayload(resource, req.body || {});
  const keys = Object.keys(payload);
  if (!keys.length) {
    res.status(400).json({ error: "No valid fields provided" });
    return;
  }

  const rowId = id();
  await pool.query(
    `INSERT INTO ${resource.table} (id, ${keys.map((key) => `\`${key}\``).join(", ")}) VALUES (?, ${keys.map(() => "?").join(", ")})`,
    [rowId, ...keys.map((key) => payload[key])]
  );
  res.status(201).json({ id: rowId });
});

app.put("/api/admin/resources/:resource/:id", requireAdmin, async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const payload = pickPayload(resource, req.body || {});
  const keys = Object.keys(payload);
  if (!keys.length) {
    res.status(400).json({ error: "No valid fields provided" });
    return;
  }

  await pool.query(
    `UPDATE ${resource.table} SET ${keys.map((key) => `\`${key}\` = ?`).join(", ")} WHERE id = ?`,
    [...keys.map((key) => payload[key]), req.params.id]
  );
  res.json({ success: true });
});

app.delete("/api/admin/resources/:resource/:id", requireAdmin, async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  await pool.query(`DELETE FROM ${resource.table} WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
});

app.put("/api/admin/integrations/:type", requireAdmin, async (req, res) => {
  const type = req.params.type;
  const body = req.body || {};
  const name = body.name || type;
  const apiKey = body.api_key || null;
  const apiSecret = body.api_secret || null;
  const config = body.config ? JSON.stringify(body.config) : null;
  const isActive = Boolean(body.is_active);

  const [[existing]] = await pool.query("SELECT id FROM integrations WHERE type = ? ORDER BY updated_at DESC, created_at DESC LIMIT 1", [type]);

  if (existing) {
    await pool.query(
      "UPDATE integrations SET name = ?, api_key = ?, api_secret = ?, config = ?, is_active = ? WHERE id = ?",
      [name, apiKey, apiSecret, config, isActive, existing.id]
    );
    res.json({ id: existing.id, success: true });
    return;
  }

  const rowId = id();
  await pool.query(
    "INSERT INTO integrations (id, name, type, api_key, api_secret, config, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [rowId, name, type, apiKey, apiSecret, config, isActive]
  );
  res.status(201).json({ id: rowId, success: true });
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const product = req.body || {};
  const productId = id();

  await pool.query(
    `INSERT INTO products
      (id, name, slug, description, short_description, base_price, sale_price, purchase_price, sku, stock_quantity, category_id, brand_id, image_url, images, is_active, is_featured, weight, unit)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      productId,
      product.name,
      product.slug,
      product.description || null,
      product.short_description || null,
      product.base_price || 0,
      product.sale_price || null,
      product.purchase_price || null,
      product.sku || null,
      product.stock_quantity || 0,
      product.category_id || null,
      product.brand_id || null,
      product.image_url || null,
      JSON.stringify(product.images || []),
      product.is_active ?? true,
      product.is_featured ?? false,
      product.weight || null,
      product.unit || null,
    ]
  );

  res.status(201).json({ id: productId });
});

app.listen(Number(process.env.PORT || 5000), () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});
