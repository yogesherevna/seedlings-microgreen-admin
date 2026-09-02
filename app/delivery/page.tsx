"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAuth } from "@/components/auth/AuthProvider";
import { createRecord, listCollection, updateRecord } from "@/lib/firestore";
import { assignOrderToDelivery, updateDeliveryAssignmentStatus } from "@/lib/deliveryService";
import type { DeliveryUser, DeliveryUserStatus, DeliveryAssignment } from "@/types/delivery";
import type { Order } from "@/types/order";

type Tab = "operations" | "users";

function userName(u: DeliveryUser) { return u.name?.trim() || "Unnamed delivery user"; }

export default function DeliveryPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<DeliveryUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedUser, setSelectedUser] = useState<DeliveryUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [tab, setTab] = useState<Tab>("operations");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [deliveryUsers, orderData, assignmentData] = await Promise.all([
        listCollection<DeliveryUser>("deliveryUsers"),
        listCollection<Order>("orders"),
        listCollection<DeliveryAssignment>("deliveryAssignments", "assignedAt")
      ]);
      setUsers(deliveryUsers);
      setOrders(orderData);
      setAssignments(assignmentData);
      setError("");
    } catch {
      setError("Unable to load delivery operations. Check Firestore rules/indexes.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const activeUsers = useMemo(() => users.filter(u => u.status === "active"), [users]);
  const handoverOrders = useMemo(
    () => orders.filter(o => ["ready_for_handover", "handed_to_delivery", "out_for_delivery"].includes(o.status)),
    [orders]
  );
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => !q || [u.name, u.mobileNumber, u.email, u.vehicleType, u.vehicleNumber].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [users, search]);

  async function updateAssignment(a: DeliveryAssignment, status: DeliveryAssignment["status"]) {
    if (!user) return;
    try {
      await updateDeliveryAssignmentStatus(a.id, status, user.uid, user.email ?? undefined);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update delivery status."); }
  }

  async function assign() {
    if (!selectedOrder || !selectedUserId || !user) return;
    const deliveryUser = activeUsers.find(u => u.id === selectedUserId);
    if (!deliveryUser) return;
    try {
      await assignOrderToDelivery(selectedOrder, deliveryUser, user.uid, user.email ?? undefined);
      setSelectedOrder(null); setSelectedUserId(""); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to assign order."); }
  }

  async function saveDeliveryUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const mobileNumber = String(form.get("mobileNumber") ?? "").trim();
    const authUid = String(form.get("authUid") ?? "").trim();
    if (!name || !mobileNumber || !authUid) {
      setError("Name, mobile number and Firebase Auth UID are required.");
      return;
    }
    try {
      const data = {
        authUid, name, mobileNumber,
        email: String(form.get("email") ?? "").trim(),
        vehicleType: String(form.get("vehicleType") ?? "").trim(),
        vehicleNumber: String(form.get("vehicleNumber") ?? "").trim(),
        status: "active" as DeliveryUserStatus
      };
      if (selectedUser) await updateRecord("deliveryUsers", selectedUser.id, data);
      else await createRecord("deliveryUsers", data);
      setSelectedUser(null);
      setTab("users");
      await load();
    } catch { setError(selectedUser ? "Unable to update delivery user." : "Unable to create delivery user."); }
  }

  async function toggleUser(u: DeliveryUser) {
    const next = u.status === "active" ? "inactive" : "active";
    const action = next === "inactive" ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} ${userName(u)}?`)) return;
    try { await updateRecord("deliveryUsers", u.id, { status: next }); await load(); }
    catch { setError("Unable to update delivery user."); }
  }

  function openCreate() { setSelectedUser(null); setError(""); setTab("users"); }
  function openEdit(u: DeliveryUser) { setSelectedUser(u); setError(""); setTab("users"); }

  return <AdminPage>
    <div className="container-fluid py-3">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h1 className="h3 seedlings-brand mb-1">Delivery Operations</h1>
          <p className="text-muted mb-0">Assign eligible orders and manage delivery users.</p>
        </div>
        {tab === "users" && !selectedUser && (
          <button className="btn btn-success" onClick={openCreate}><i className="bi bi-person-plus me-1" /> Add Delivery User</button>
        )}
        {tab === "operations" && (
          <div className="d-flex gap-2">
            <span className="badge text-bg-success align-self-center">{activeUsers.length} active users</span>
            <span className="badge text-bg-warning align-self-center">{handoverOrders.filter(o => o.status === "ready_for_handover").length} awaiting assignment</span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === "operations" ? "active" : ""}`} onClick={() => { setTab("operations"); setSelectedUser(null); }}> <i className="bi bi-truck me-1" /> Delivery Operations</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}> <i className="bi bi-people me-1" /> Delivery Users <span className="badge text-bg-secondary ms-1">{users.length}</span></button></li>
      </ul>

      {tab === "operations" ? (
        <>
          <div className="card mb-3">
            <div className="card-header"><h3 className="card-title mb-0">Orders Ready for Delivery</h3></div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Delivery User</th><th className="text-end">Action</th></tr></thead>
                <tbody>
                  {handoverOrders.map(order => <tr key={order.id}>
                    <td><strong>{order.orderNumber || order.id.slice(0, 8)}</strong><div className="small text-muted">₹{order.total.toFixed(2)}</div></td>
                    <td>{order.customerName || order.customerMobile || order.customerId}</td>
                    <td><span className="badge text-bg-light">{order.status.replaceAll("_", " ")}</span></td>
                    <td>{(order as Order & { deliveryUserName?: string }).deliveryUserName || <span className="text-warning">Unassigned</span>}</td>
                    <td className="text-end">{order.status === "ready_for_handover" && <button className="btn btn-sm btn-success" onClick={() => setSelectedOrder(order)} disabled={!activeUsers.length}><i className="bi bi-person-plus me-1" /> Assign</button>}</td>
                  </tr>)}
                  {!handoverOrders.length && !loading && <tr><td colSpan={5} className="text-center text-muted py-5"><i className="bi bi-truck fs-2 d-block mb-2" />No orders currently ready for delivery.</td></tr>}
                  {loading && <tr><td colSpan={5} className="text-center py-5"><span className="spinner-border spinner-border-sm me-2" />Loading delivery operations...</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {selectedOrder && <div className="card border-success mb-3">
            <div className="card-header"><h3 className="card-title mb-0">Assign {selectedOrder.orderNumber || selectedOrder.id}</h3></div>
            <div className="card-body">
              <p>Customer: <strong>{selectedOrder.customerName || selectedOrder.customerId}</strong></p>
              <label className="form-label">Delivery user</label>
              <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                <option value="">Select active delivery user</option>
                {activeUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.mobileNumber}{u.vehicleNumber ? ` — ${u.vehicleNumber}` : ""}</option>)}
              </select>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2"><button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Cancel</button><button className="btn btn-success" disabled={!selectedUserId} onClick={() => void assign()}>Assign & hand over</button></div>
          </div>}

          <div className="card">
            <div className="card-header"><h3 className="card-title mb-0">Recent Assignments</h3></div>
            <div className="table-responsive"><table className="table table-hover align-middle mb-0">
              <thead><tr><th>Order</th><th>Delivery User</th><th>Status</th><th>Assigned By</th><th className="text-end">Update</th></tr></thead>
              <tbody>
                {assignments.slice(0, 20).map(a => <tr key={a.id}><td>{a.orderNumber || a.orderId}</td><td>{a.deliveryUserName}</td><td><span className="badge text-bg-light">{a.status.replaceAll("_", " ")}</span></td><td>{a.assignedByEmail || a.assignedByUid}</td><td className="text-end text-nowrap">{a.status === "assigned" && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => void updateAssignment(a, "accepted")}>Accept</button>}{["assigned","accepted"].includes(a.status) && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => void updateAssignment(a, "out_for_delivery")}>Out for delivery</button>}{a.status === "out_for_delivery" && <button className="btn btn-sm btn-success" onClick={() => void updateAssignment(a, "delivered")}>Delivered</button>}</td></tr>)}
                {!assignments.length && <tr><td colSpan={5} className="text-center text-muted py-4">No delivery assignments yet.</td></tr>}
              </tbody>
            </table></div>
          </div>
        </>
      ) : (
        selectedUser ? (
          <div className="card">
            <div className="card-header"><h3 className="card-title mb-0">Edit Delivery User</h3></div>
            <DeliveryUserForm user={selectedUser} onSubmit={saveDeliveryUser} onCancel={() => setSelectedUser(null)} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <div className="row g-2 align-items-center">
                <div className="col-md-8"><div className="input-group"><span className="input-group-text"><i className="bi bi-search" /></span><input className="form-control" placeholder="Search delivery users..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
                <div className="col-md-4 text-md-end text-muted small align-self-center">{filteredUsers.length} of {users.length} users</div>
              </div>
            </div>
            <div className="table-responsive"><table className="table table-hover align-middle mb-0">
              <thead><tr><th>Delivery User</th><th>Mobile</th><th>Email</th><th>Vehicle</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => <tr key={u.id}>
                  <td><strong>{userName(u)}</strong></td><td>{u.mobileNumber || "—"}</td><td>{u.email || "—"}</td><td>{[u.vehicleType, u.vehicleNumber].filter(Boolean).join(" / ") || "—"}</td>
                  <td><span className={`badge text-bg-${u.status === "active" ? "success" : "secondary"}`}>{u.status}</span></td>
                  <td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}><i className="bi bi-pencil me-1" />Edit</button><button className="btn btn-sm btn-outline-secondary" onClick={() => void toggleUser(u)}>{u.status === "active" ? "Deactivate" : "Activate"}</button></td>
                </tr>)}
                {!filteredUsers.length && !loading && <tr><td colSpan={6} className="text-center text-muted py-5">No delivery users found.</td></tr>}
              </tbody>
            </table></div>
          </div>
        )
      )}

      {tab === "users" && !selectedUser && users.length === 0 && (
        <div className="alert alert-info mt-3">No delivery users yet. Use <strong>Add Delivery User</strong> to create the first profile.</div>
      )}
    </div>
  </AdminPage>;
}

function DeliveryUserForm({ user, onSubmit, onCancel }: { user: DeliveryUser | null; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form onSubmit={onSubmit}>
    <div className="card-body">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border">
            <div className="card-header"><strong>Personal Information</strong></div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Name *</label><input name="name" className="form-control" defaultValue={user?.name || ""} required /></div>
                <div className="col-md-6 mb-3"><label className="form-label">Mobile *</label><input name="mobileNumber" className="form-control" defaultValue={user?.mobileNumber || ""} required /></div>
              </div>
              <div><label className="form-label">Email</label><input name="email" type="email" className="form-control" defaultValue={user?.email || ""} /></div>
            </div>
          </div>
          <div className="card border mt-3">
            <div className="card-header"><strong>Vehicle</strong></div>
            <div className="card-body"><div className="row">
              <div className="col-md-6"><label className="form-label">Vehicle type</label><input name="vehicleType" className="form-control" placeholder="Bike" defaultValue={user?.vehicleType || ""} /></div>
              <div className="col-md-6"><label className="form-label">Vehicle number</label><input name="vehicleNumber" className="form-control" defaultValue={user?.vehicleNumber || ""} /></div>
            </div></div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border">
            <div className="card-header"><strong>Authentication</strong></div>
            <div className="card-body">
              <label className="form-label">Firebase Auth UID *</label>
              <input name="authUid" className="form-control font-monospace" defaultValue={user?.authUid || ""} required />
              <div className="form-text">Use the UID of the Firebase Authentication account linked to this delivery user. This is an internal account identifier.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="card-footer d-flex justify-content-end gap-2"><button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button><button className="btn btn-success">{user ? "Update Delivery User" : "Create Delivery User"}</button></div>
  </form>;
}
