import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/lib/adminApi";

export function useAdmin() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: admin, error } = await supabase.rpc("is_admin");
      if (error || !admin) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { user: authUser } = session;
      setUser({
        id: authUser.id,
        email: authUser.email || "",
        phone: authUser.phone || null,
        full_name: authUser.user_metadata?.full_name || null,
        roles: ["admin"],
        is_admin: true,
      });
      setIsAdmin(true);
      setLoading(false);
    };

    verifySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void verifySession();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isAdmin, loading, signOut };
}
