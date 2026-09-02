import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { BootstrapClient } from "@/components/admin/BootstrapClient";

export const metadata: Metadata = {
  title: "Seedlings Admin",
  description: "Seedlings administrative portal"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}