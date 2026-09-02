"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppContent, Card, SmallBox } from "@adminlte/react";
import { AdminPage } from "@/components/admin/AdminPage";
import { listCollection } from "@/lib/firestore";
import type { Product } from "@/types/catalog";
import type { Order } from "@/types/order";
import type { Customer } from "@/types/customer";

function KpiCard({ value, label, icon, href }: { value: string; label: string; icon: string; href: string }) {
  return (
    <div className="col-xl-3 col-sm-6">
      <Link href={href} className="text-decoration-none seedlings-kpi-card">
        <div className="card h-100 mb-0">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <div className="seedlings-kpi-label">{label}</div>
                <div className="seedlings-kpi-value">{value}</div>
              </div>
              <div className="seedlings-kpi-icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
              </div>
            </div>
            <div className="seedlings-kpi-link mt-3">View {label.toLowerCase()} <i className="bi bi-arrow-right ms-1" /></div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, stock: 0, orders: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [products, orders, customers] = await Promise.all([
          listCollection<Product>("products"),
          listCollection<Order>("orders"),
          listCollection<Customer>("customers"),
        ]);
        if (!active) return;
        setStats({
          products: products.length,
          stock: products.reduce((sum, product) => sum + (Number(product.stockGrams ?? product.stock ?? 0) || 0), 0),
          orders: orders.length,
          customers: customers.length,
        });
      } catch {
        // Keep the dashboard usable if an optional collection is unavailable.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const value = (n: number) => loading ? "—" : n.toLocaleString("en-IN");

  return (
    <AdminPage>
      <AppContent title="Dashboard" breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}>
        <div className="seedlings-page-intro mb-3">
          <h2 className="h4 mb-1">Welcome to Seedlings Admin</h2>
          <p className="text-body-secondary mb-0">A quick view of your catalogue, stock and customer operations.</p>
        </div>

        <div className="row g-3 seedlings-kpi-row">
          <KpiCard value={value(stats.products)} label="Products" icon="bi-box-seam" href="/products" />
          <KpiCard value={value(stats.stock)} label="Current Stock" icon="bi-boxes" href="/inventory" />
          <KpiCard value={value(stats.orders)} label="Orders" icon="bi-receipt" href="/orders" />
          <KpiCard value={value(stats.customers)} label="Customers" icon="bi-people" href="/customers" />
        </div>

        <div className="row g-3 mt-1">
          <div className="col-lg-8">
            <Card title="Seedlings overview" theme="success">
              <div className="row g-3">
                <div className="col-md-4"><div className="seedlings-dashboard-stat"><span>Catalogue</span><strong>{value(stats.products)}</strong><Link href="/products">Manage products</Link></div></div>
                <div className="col-md-4"><div className="seedlings-dashboard-stat"><span>Stock (grams)</span><strong>{value(stats.stock)}</strong><Link href="/inventory">View inventory</Link></div></div>
                <div className="col-md-4"><div className="seedlings-dashboard-stat"><span>Orders</span><strong>{value(stats.orders)}</strong><Link href="/orders">Manage orders</Link></div></div>
              </div>
            </Card>
          </div>
          <div className="col-lg-4">
            <Card title="Quick actions" theme="success">
              <div className="d-grid gap-2">
                <Link href="/products" className="btn btn-success"><i className="bi bi-box-seam me-2" />Manage Products</Link>
                <Link href="/orders" className="btn btn-outline-success"><i className="bi bi-cart3 me-2" />Open Orders</Link>
                <Link href="/inventory" className="btn btn-outline-success"><i className="bi bi-boxes me-2" />Open Inventory</Link>
                <Link href="/cms" className="btn btn-outline-success"><i className="bi bi-layout-text-window me-2" />Website CMS</Link>
              </div>
            </Card>
          </div>
        </div>
      </AppContent>
    </AdminPage>
  );
}
