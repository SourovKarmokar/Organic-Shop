import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

function mapProduct(product: Record<string, unknown>) {
  const category = product.categories as { slug?: string; name?: string } | null;
  const brand = product.brands as { name?: string } | null;
  return {
    ...product,
    category_slug: category?.slug || "",
    category_name: category?.name || "",
    brand_name: brand?.name || "",
  };
}

async function supabasePublicApi<T>(path: string, options: RequestInit): Promise<T> {
  if (path === "/api/public/products") {
    const result = await supabase
      .from("products")
      .select("*, categories(slug,name), brands(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return unwrap(result.data?.map((row) => mapProduct(row)) as T, result.error);
  }

  if (path === "/api/public/categories") {
    const result = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return unwrap(result.data as T, result.error);
  }

  if (path === "/api/public/shipping") {
    const result = await supabase
      .from("shipping_charges")
      .select("area_name,charge")
      .eq("is_active", true);
    return unwrap(result.data as T, result.error);
  }

  const productSlug = path.match(/^\/api\/public\/products\/(.+)$/)?.[1];
  if (productSlug) {
    const productResult = await supabase
      .from("products")
      .select("*, categories(slug,name), brands(name)")
      .eq("slug", decodeURIComponent(productSlug))
      .eq("is_active", true)
      .single();
    const product = unwrap(productResult.data, productResult.error);
    const variantsResult = await supabase
      .from("product_variants")
      .select("*, colors(name,hex_code), sizes(name,value)")
      .eq("product_id", product.id)
      .eq("is_active", true);
    const variants = unwrap(variantsResult.data, variantsResult.error);
    return { product: mapProduct(product), variants } as T;
  }

  const categorySlug = path.match(/^\/api\/public\/categories\/(.+)$/)?.[1];
  if (categorySlug) {
    const categoryResult = await supabase
      .from("categories")
      .select("*")
      .eq("slug", decodeURIComponent(categorySlug))
      .eq("is_active", true)
      .single();
    const category = unwrap(categoryResult.data, categoryResult.error);
    const subResult = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", category.id)
      .eq("is_active", true)
      .order("sort_order");
    const subCategories = unwrap(subResult.data, subResult.error);
    const categoryIds = [category.id, ...subCategories.map((item) => item.id)];
    const productsResult = await supabase
      .from("products")
      .select("*, categories(slug,name), brands(name)")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const products = unwrap(productsResult.data, productsResult.error).map((row) => mapProduct(row));
    return { category, subCategories, products } as T;
  }

  if (path === "/api/public/orders" && options.method === "POST") {
    const body = JSON.parse(String(options.body || "{}"));
    const statusResult = await supabase
      .from("order_statuses")
      .select("id")
      .eq("name", "Pending")
      .single();
    const status = unwrap(statusResult.data, statusResult.error);
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const orderResult = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: body.customer.name,
        customer_phone: body.customer.phone,
        customer_address: body.customer.address,
        delivery_area: body.area,
        status_id: status.id,
        subtotal: body.subtotal,
        delivery_charge: body.delivery_charge,
        total: Number(body.subtotal) + Number(body.delivery_charge),
        payment_method: body.payment_method,
      })
      .select("id,order_number")
      .single();
    const order = unwrap(orderResult.data, orderResult.error);
    const itemsResult = await supabase.from("order_items").insert(
      body.items.map((item: Record<string, unknown>) => ({ ...item, order_id: order.id })),
    );
    unwrap(itemsResult.data, itemsResult.error);
    return { order_number: order.order_number } as T;
  }

  throw new Error(`Unsupported public API path: ${path}`);
}

export async function publicApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) return supabasePublicApi<T>(path, options);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || response.statusText);
  }
  return response.json();
}

export { API_BASE_URL };
