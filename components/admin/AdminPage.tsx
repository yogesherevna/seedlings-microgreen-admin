import { DashboardLayout } from "@adminlte/react";
import { ProtectedAdmin } from "@/components/auth/ProtectedAdmin";
import { menuItems } from "@/lib/menu";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedAdmin>
      <DashboardLayout
        menuItems={menuItems}
        fixedHeader
        fixedSidebar
        sidebarMini
        colorModeToggle
        topbarEnd={<AdminTopbar />}
      >
        <div className="seedlings-admin-content">{children}</div>
      </DashboardLayout>
    </ProtectedAdmin>
  );
}
