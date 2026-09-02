"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { listCollection } from "@/lib/firestore";
import { buildForecast } from "@/lib/forecastService";
import type { Product } from "@/types/catalog";
import type { GrowingBatch } from "@/types/growingBatch";
import type { Order } from "@/types/order";
import type { ForecastRow } from "@/types/forecast";
import type { Subscription } from "@/types/subscription";

const PERIODS = [30, 60, 90];

export default function ForecastingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<GrowingBatch[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const [onlyNeed, setOnlyNeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [p, o, b, subData] = await Promise.all([
        listCollection<Product>("products"),
        listCollection<Order>("orders", "createdAt"),
        listCollection<GrowingBatch>("growingBatches", "startDate"),
        listCollection<Subscription>("subscriptions"),
      ]);
      setProducts(p);
      setOrders(o);
      setBatches(b);
      setSubscriptions(subData);
      setError("");
    } catch {
      setError("Unable to load forecasting data. Check Firestore rules/indexes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const rows = useMemo(() => buildForecast(products, orders, batches, days, new Date(), subscriptions), [products, orders, batches, days, subscriptions]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r =>
      (!q || r.productName.toLowerCase().includes(q)) &&
      (!onlyNeed || r.recommendedTrays > 0)
    );
  }, [rows, search, onlyNeed]);

  const totals = useMemo(() => ({
    productsNeedingGrow: rows.filter(r => r.recommendedTrays > 0).length,
    additionalGrams: rows.reduce((s, r) => s + r.additionalGramsNeeded, 0),
    trays: rows.reduce((s, r) => s + r.recommendedTrays, 0),
    committed: rows.reduce((s, r) => s + r.committedOrderGrams, 0),
  }), [rows]);

  return <AdminPage>
    <div className="container-fluid py-3">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h1 className="h3 seedlings-brand mb-1">Production Forecast</h1>
          <p className="text-muted mb-0">Use recent order demand, current stock and growing batches to plan what to grow next.</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1"/>Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="alert alert-info">
        <strong>How this forecast works:</strong> it uses fulfilled orders from the selected history period to calculate average daily demand, projects that demand across each product's growing cycle, adds currently committed orders and safety stock, then subtracts current inventory and usable quantity already in growing batches.
      </div>

      <div className="row g-3 mb-3">
        <Kpi label="Products to grow" value={totals.productsNeedingGrow} icon="bi-seedling" />
        <Kpi label="Additional grams needed" value={`${totals.additionalGrams.toLocaleString()} g`} icon="bi-box-seam" />
        <Kpi label="Recommended trays" value={totals.trays.toLocaleString()} icon="bi-grid-3x3-gap" />
        <Kpi label="Committed orders" value={`${totals.committed.toLocaleString()} g`} icon="bi-cart-check" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="row g-2 align-items-center">
            <div className="col-lg-5">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"/></span>
                <input className="form-control" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-lg-3">
              <select className="form-select" value={days} onChange={e => setDays(Number(e.target.value))}>
                {PERIODS.map(d => <option key={d} value={d}>Last {d} days</option>)}
              </select>
            </div>
            <div className="col-lg-4 d-flex justify-content-lg-end align-items-center gap-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="only-need" checked={onlyNeed} onChange={e => setOnlyNeed(e.target.checked)} />
                <label className="form-check-label" htmlFor="only-need">Only show products to grow</label>
              </div>
              <span className="small text-muted">{filtered.length} products</span>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr>
              <th>Product</th>
              <th>Cycle</th>
              <th>Avg daily demand</th>
              <th>Cycle forecast</th>
              <th>Committed</th>
              <th>Current stock</th>
              <th>In production</th>
              <th>Need to grow</th>
              <th>Trays</th>
              <th>Coverage</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => <ForecastTableRow key={r.productId} row={r} />)}
              {!filtered.length && !loading && <tr><td colSpan={10} className="text-center text-muted py-5">
                <i className="bi bi-bar-chart-line fs-2 d-block mb-2"/>
                {onlyNeed ? "No products currently need additional growing." : "No forecasting data available yet."}
              </td></tr>}
              {loading && <tr><td colSpan={10} className="text-center py-5"><span className="spinner-border spinner-border-sm me-2"/>Loading forecast...</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-footer small text-muted">
          Forecast is a planning estimate, not an automatic purchase or growing instruction. More historical fulfilled orders will make the estimate more useful.
        </div>
      </div>
    </div>
  </AdminPage>;
}

function Kpi({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return <div className="col-md-6 col-xl-3">
    <div className="info-box h-100">
      <span className="info-box-icon text-bg-success"><i className={`bi ${icon}`}/></span>
      <div className="info-box-content"><span className="info-box-text">{label}</span><span className="info-box-number">{value}</span></div>
    </div>
  </div>;
}

function ForecastTableRow({ row }: { row: ForecastRow }) {
  const needs = row.recommendedTrays > 0;
  return <tr>
    <td><strong>{row.productName}</strong><div className="small text-muted">{row.confidence} confidence</div></td>
    <td>{row.cycleDays} days</td>
    <td>{row.averageDailyDemandGrams.toLocaleString()} g</td>
    <td>{row.cycleDemandForecastGrams.toLocaleString()} g</td>
    <td>{row.committedOrderGrams.toLocaleString()} g</td>
    <td>{row.currentStockGrams.toLocaleString()} g</td>
    <td>{row.inProductionGrams.toLocaleString()} g</td>
    <td className={needs ? "fw-bold text-danger" : "text-success"}>{row.additionalGramsNeeded.toLocaleString()} g</td>
    <td>{needs ? <span className="badge text-bg-warning">{row.recommendedTrays}</span> : <span className="text-success">0</span>}</td>
    <td>{row.coverageDays == null ? "No demand" : `${row.coverageDays} days`}</td>
  </tr>;
}
