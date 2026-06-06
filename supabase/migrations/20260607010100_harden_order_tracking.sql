-- Do not expose every customer's order details through the anonymous API.

DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "View order items" ON public.order_items;
CREATE POLICY "Users view own order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.track_order(
  _order_number text,
  _customer_phone text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', jsonb_build_object(
      'name', os.name,
      'color', os.color
    ),
    'total', o.total,
    'payment_method', o.payment_method,
    'payment_status', o.payment_status,
    'created_at', o.created_at,
    'updated_at', o.updated_at
  )
  FROM public.orders o
  JOIN public.order_statuses os ON os.id = o.status_id
  WHERE lower(o.order_number) = lower(trim(_order_number))
    AND regexp_replace(o.customer_phone, '\D', '', 'g')
      = regexp_replace(_customer_phone, '\D', '', 'g')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;

