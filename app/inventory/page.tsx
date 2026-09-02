"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { listCollection } from "@/lib/firestore";
import type { InventoryAdjustment, Product } from "@/types/catalog";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [p, a] = await Promise.all([
        listCollection<Product>("products"),
        listCollection<InventoryAdjustment>("inventoryAdjustments", "createdAt")
      ]);
      setProducts(p);
      setAdjustments(a);
      setError("");
    } catch {
      setError("Unable to load inventory. Check Firestore rules/indexes.");
    }
  }

  useEffect(() => { void load(); }, []);

  const lowStock = products.filter(p => Number(p.stockGrams ?? p.stock ?? 0) <= Number(p.lowStockThresholdGrams ?? p.lowStockThreshold ?? 0) && p.status !== "inactive");

  return <AdminPage>
    <div className="container-fluid py-3">
      <div className="mb-3">
        <h1 className="h3 seedlings-brand">Inventory</h1>
        <p className="text-muted mb-0">Actual inventory in grams, low-stock warnings and adjustment history.</p>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-4 mb-3">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Low stock</h3></div>
            <div className="card-body p-0">
              {lowStock.length ? <div className="list-group list-group-flush">
                {lowStock.map(p => <div className="list-group-item d-flex justify-content-between" key={p.id}>
                  <span><strong>{p.name}</strong><br/><small className="text-muted">Threshold {Number(p.lowStockThresholdGrams ?? p.lowStockThreshold ?? 0).toLocaleString()}g</small></span>
                  <span className="badge text-bg-warning align-self-center">{Number(p.stockGrams ?? p.stock ?? 0).toLocaleString()} g</span>
                </div>)}
              </div> : <div className="p-3 text-muted">No low-stock products.</div>}
            </div>
          </div>
        </div>

        <div className="col-lg-8 mb-3">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Current stock</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover mb-0">
                <thead><tr><th>Product</th><th>Available</th><th>Low-stock threshold</th><th>Status</th></tr></thead>
                <tbody>{products.map(p => <tr key={p.id}>
                  <td>{p.name}</td><td className={Number(p.stockGrams ?? p.stock ?? 0) <= Number(p.lowStockThresholdGrams ?? p.lowStockThreshold ?? 0) ? "text-danger fw-bold" : ""}>{Number(p.stockGrams ?? p.stock ?? 0).toLocaleString()} g</td>
                  <td>{Number(p.lowStockThresholdGrams ?? p.lowStockThreshold ?? 0).toLocaleString()} g</td><td>{p.status}</td>
                </tr>)}
                {!products.length && <tr><td colSpan={4} className="text-center text-muted py-4">No products.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Adjustment history</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-sm table-hover mb-0">
                <thead><tr><th>Product</th><th>Type</th><th>Qty (g)</th><th>Before (g)</th><th>After (g)</th><th>Reason</th><th>Created by</th></tr></thead>
                <tbody>{adjustments.map(a => <tr key={a.id}>
                  <td>{a.productName}</td><td>{a.type}</td><td>{Number(a.quantity ?? 0).toLocaleString()} g</td><td>{Number(a.previousStock ?? 0).toLocaleString()} g</td><td>{Number(a.newStock ?? 0).toLocaleString()} g</td>
                  <td>{a.reason}</td><td>{a.createdByEmail || a.createdByUid}</td>
                </tr>)}
                {!adjustments.length && <tr><td colSpan={7} className="text-center text-muted py-4">No adjustments yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminPage>;
}