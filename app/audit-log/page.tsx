"use client";
import {useEffect,useState} from "react";
import {AdminPage} from "@/components/admin/AdminPage";
import {listCollection} from "@/lib/firestore";
import type {AuditEvent} from "@/types/security";
export default function AuditLogPage(){const[items,setItems]=useState<AuditEvent[]>([]);const[error,setError]=useState("");
useEffect(()=>{void(async()=>{try{setItems(await listCollection<AuditEvent>("auditEvents","createdAt"))}catch{setError("Unable to load audit log.")}})()},[]);
return <AdminPage><div className="container-fluid py-3"><h1 className="h3 seedlings-brand">Audit Log</h1><p className="text-muted">Administrative activity history.</p>{error&&<div className="alert alert-danger">{error}</div>}<div className="card"><div className="card-body table-responsive p-0"><table className="table table-hover mb-0"><thead><tr><th>Action</th><th>Entity</th><th>Summary</th><th>Actor</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td>{i.action}</td><td>{i.entityType} {i.entityId||""}</td><td>{i.summary}</td><td>{i.actorEmail||i.actorUid}</td></tr>)}{!items.length&&<tr><td colSpan={4} className="text-center text-muted py-4">No audit events yet.</td></tr>}</tbody></table></div></div></div></AdminPage>}
