"use client";
import {useEffect,useState} from "react";
import {AdminPage} from "@/components/admin/AdminPage";
import {createRecord,listCollectionByField,updateRecord} from "@/lib/firestore";

const ITEMS=[
 {key:"home",label:"Home",url:"/",location:"header" as const},
 {key:"microgreens",label:"Microgreens",url:"/microgreens",location:"header" as const},
 {key:"journey",label:"Journey",url:"/journey",location:"header" as const},
 {key:"contact",label:"Contact",url:"/contact",location:"header" as const},
 {key:"account",label:"Account",url:"/account",location:"header" as const},
 {key:"cart",label:"Cart",url:"/cart",location:"header" as const},
 {key:"shopCta",label:"Shop Fresh",url:"/microgreens",location:"header" as const},
 {key:"footerMicrogreens",label:"Microgreens",url:"/microgreens",location:"footer" as const},
 {key:"footerJourney",label:"Our Journey",url:"/journey",location:"footer" as const},
 {key:"footerContact",label:"Contact",url:"/contact",location:"footer" as const},
 {key:"footerAccount",label:"My Account",url:"/account",location:"footer" as const},
] as const;
type Item={id:string;navKey:string;label:string;url:string;status:"draft"|"published"};
export default function NavigationPage(){const[items,setItems]=useState<Item[]>([]),[error,setError]=useState("");
 async function load(){try{const r=await listCollectionByField<Item>("cmsNavigation","navKey","home");const all=await import("@/lib/firestore").then(m=>m.listCollection<Item>("cmsNavigation"));setItems(all);setError("")}catch{setError("Unable to load navigation.")}}useEffect(()=>{void load()},[]);
 async function save(def:{key:string;label:string;url:string;location:"header"|"footer"}){try{const existing=items.find(x=>x.navKey===def.key);const p={navKey:def.key,label:def.label,url:def.url,status:"published" as const};if(existing)await updateRecord("cmsNavigation",existing.id,p);else await createRecord("cmsNavigation",p);await load()}catch{setError("Unable to save navigation.")}}
 return <AdminPage><div className="container-fluid py-3"><h1 className="h3 seedlings-brand">Navigation</h1><p className="text-muted">Fixed V2 navigation. You can edit the displayed label only; items, routes and order are controlled by the website.</p>{error&&<div className="alert alert-danger">{error}</div>}<div className="card"><div className="card-body table-responsive p-0"><table className="table mb-0"><thead><tr><th>Area</th><th>V2 item</th><th>Label shown</th><th>Route</th><th>Action</th></tr></thead><tbody>{ITEMS.map(def=>{const x=items.find(i=>i.navKey===def.key);return <tr key={def.key}><td>{def.location}</td><td>{def.label}</td><td><input className="form-control" defaultValue={x?.label??def.label} id={"nav-"+def.key}/></td><td><code>{def.url}</code></td><td><button className="btn btn-sm btn-outline-primary" onClick={()=>{const el=document.getElementById("nav-"+def.key) as HTMLInputElement|null;void save({...def,label:el?.value?.trim()||def.label})}}>Save</button></td></tr>})}</tbody></table></div></div></div></AdminPage>}
