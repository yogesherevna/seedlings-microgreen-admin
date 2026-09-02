"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { logoutAdmin } from "@/lib/auth";

export function AdminTopbar() {
  const router = useRouter();
  const { user } = useAuth();

  async function logout() {
    await logoutAdmin();
    router.replace("/login");
  }

  return (
    <div className="d-flex align-items-center gap-2 seedlings-topbar-user">
      <div className="d-none d-md-flex align-items-center gap-2 me-1">
        <span className="seedlings-user-avatar"><i className="bi bi-person-fill" /></span>
        <span className="small fw-semibold">{user?.email ?? "Admin"}</span>
      </div>
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout}>
        <i className="bi bi-box-arrow-right me-1" /> Logout
      </button>
    </div>
  );
}
