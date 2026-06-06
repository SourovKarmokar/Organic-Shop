import { useEffect, useState } from "react";
import {
  adminApi,
  clearAdminSession,
  getAdminToken,
  getStoredAdminUser,
  type AdminUser,
} from "@/lib/adminApi";

export function useAdmin() {
  const [user, setUser] = useState<AdminUser | null>(getStoredAdminUser());
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = getAdminToken();
      if (!token) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const data = await adminApi<{ user: AdminUser }>("/api/admin/me");
        setUser(data.user);
        setIsAdmin(data.user.is_admin);
      } catch {
        clearAdminSession();
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const signOut = () => {
    clearAdminSession();
    setUser(null);
    setIsAdmin(false);
  };

  return { user, isAdmin, loading, signOut };
}
