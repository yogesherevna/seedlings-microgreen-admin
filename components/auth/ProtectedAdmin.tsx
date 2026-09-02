"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { logoutAdmin } from "@/lib/auth";

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, authorized, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !authorized)) {
      if (user && !authorized) void logoutAdmin();
      router.replace("/login");
    }
  }, [loading, user, authorized, router]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!user || !authorized) return null;

  return <>{children}</>;
}