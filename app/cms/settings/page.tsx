"use client";
import {useEffect,useState} from "react";
import {AdminPage} from "@/components/admin/AdminPage";
import {doc,getDoc,setDoc,serverTimestamp} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {ImageUploader} from "@/components/ui/ImageUploader";
const defaults={siteName:"Seedlings Microgreen",tagline:"Fresh • Local • Thoughtfully grown",contactPhone:"+91 73785 11588",contactEmail:"info@seedlingsmicrogreen.com",address:"",logoUrl:"",footerText:"",googlePlayUrl:"",appStoreUrl:""};
export default function SiteSettings(){const[form,setForm]=useState(defaults),[msg,setMsg]=useState("");
 useEffect(()=>{void(async()=>{const s=await getDoc(doc(db,"cmsSiteSettings","site"));if(s.exists())setForm({...defaults,...(s.data() as typeof defaults)})})()},[]);
 async function save(e:React.FormEvent){e.preventDefault();await setDoc(doc(db,"cmsSiteSettings","site"),{...form,updatedAt:serverTimestamp()},{merge:true});setMsg("Saved.");setTimeout(()=>setMsg(""),2500)}
 const field=(k:keyof typeof form,label:string,area=false)=><div className="mb-3"><label className="form-label">{label}</label>{area?<textarea className="form-control" rows={3} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input className="form-control" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>}</div>;
 return <AdminPage><div className="container-fluid py-3"><h1 className="h3 seedlings-brand">Website Settings</h1><p className="text-muted">Website-wide identity and contact information used by the fixed V2 design.</p>{msg&&<div className="alert alert-success">{msg}</div>}<form onSubmit={save}><div className="card"><div className="card-body row"><div className="col-md-6">{field("siteName","Website name")}{field("tagline","Footer tagline")}{field("contactPhone","Contact phone")}{field("contactEmail","Contact email")}{field("address","Address",true)}</div><div className="col-md-6"><ImageUploader label="Website logo" value={form.logoUrl} onChange={url=>setForm({...form,logoUrl:url})}/>{field("footerText","Footer text",true)}{field("googlePlayUrl","Google Play URL")}{field("appStoreUrl","App Store URL")}</div></div><div className="card-footer"><button className="btn btn-success">Save Settings</button></div></div></form></div></AdminPage>}
