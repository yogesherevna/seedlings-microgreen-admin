import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "@/types/catalog";
import type { GrowingBatch, GrowingBatchItem, GrowingBatchStatus } from "@/types/growingBatch";

function dateFromValue(value: string) {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date.");
  return d;
}
export function addDays(date: string, days: number) {
  const d = dateFromValue(date); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10);
}
export function buildBatchItem(product: Product, startDate: string, trayCount: number): Omit<GrowingBatchItem,"id"> {
  const trays=Math.max(1,Math.round(trayCount));
  const cycle=Math.max(1,Math.round(Number(product.growingCycleDays??0)));
  const yieldPerTray=Math.max(0,Math.round(Number(product.expectedYieldGramsPerTray??product.expectedYieldGramsPerBatch??0)));
  const minPerTray=Math.max(0,Math.round(Number(product.minimumYieldGramsPerTray??product.minimumBatchYieldGrams??0)));
  const lossPerTray=Math.max(0,Math.round(Number(product.expectedLossGramsPerTray??0)));
  const expected=yieldPerTray*trays, loss=lossPerTray*trays;
  return {
    productId:product.id, productName:product.name, trayCount:trays, startDate,
    growingCycleDays:cycle, expectedReadyDate:addDays(startDate,cycle),
    expectedYieldGramsPerTray:yieldPerTray, minimumYieldGramsPerTray:minPerTray,
    expectedLossGramsPerTray:lossPerTray, expectedYieldGrams:expected,
    expectedLossGrams:loss, expectedUsableYieldGrams:Math.max(0,expected-loss),
    status:"growing",
  };
}
export async function createGrowingBatch(data:{
  batchNumber:string; startDate:string; locationId?:string; locationName?:string; notes?:string;
  items:Omit<GrowingBatchItem,"id">[]; uid:string; email?:string;
}) {
  if(!data.batchNumber.trim()) throw new Error("Batch number is required.");
  if(!data.items.length) throw new Error("Add at least one product to the batch.");
  const ref=doc(collection(db,"growingBatches"));
  const items=data.items.map((item,index)=>({...item,id:`${ref.id}-${index+1}`}));
  await runTransaction(db,async transaction=>{
    transaction.set(ref,{
      batchNumber:data.batchNumber.trim(),startDate:data.startDate,
      locationId:data.locationId??"",locationName:data.locationName??"",
      notes:data.notes?.trim()||"",status:"growing" as GrowingBatchStatus,items,
      createdByUid:data.uid,createdByEmail:data.email??"",createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
  });
  return ref.id;
}
export async function harvestGrowingBatchItem(
  batch:GrowingBatch,itemId:string,actualYieldGrams:number,actualReadyDate:string,
  wastageGrams:number,notes:string|undefined,uid:string,email?:string
){
  if(!Number.isInteger(actualYieldGrams)||actualYieldGrams<0) throw new Error("Actual harvest must be a whole number of grams.");
  if(!Number.isInteger(wastageGrams)||wastageGrams<0) throw new Error("Actual loss must be a whole number of grams.");
  if(wastageGrams>actualYieldGrams) throw new Error("Actual loss cannot be greater than the harvested quantity.");
  const netUsableYieldGrams=actualYieldGrams-wastageGrams;
  const batchItem=batch.items.find(x=>x.id===itemId);
  if(!batchItem) throw new Error("Batch item no longer exists.");
  if(["harvested","failed"].includes(batchItem.status)) throw new Error("This batch item cannot be harvested.");
  const productRef=doc(db,"products",batchItem.productId), batchRef=doc(db,"growingBatches",batch.id);
  const adjustmentRef=doc(collection(db,"inventoryAdjustments"));
  await runTransaction(db,async transaction=>{
    const [productSnap,batchSnap]=await Promise.all([transaction.get(productRef),transaction.get(batchRef)]);
    if(!productSnap.exists()) throw new Error(`Product "${batchItem.productName}" no longer exists.`);
    if(!batchSnap.exists()) throw new Error("Growing batch no longer exists.");
    const product=productSnap.data() as Product, latest=batchSnap.data() as GrowingBatch;
    const latestItem=latest.items.find(x=>x.id===itemId);
    if(!latestItem||["harvested","failed"].includes(latestItem.status)) throw new Error("This batch item was already processed.");
    const previousStock=Number(product.stockGrams??product.stock??0), newStock=previousStock+netUsableYieldGrams;
    const updatedItems=latest.items.map(x=>x.id===itemId?{...x,actualReadyDate,actualHarvestGrams:actualYieldGrams,actualYieldGrams:netUsableYieldGrams,wastageGrams,notes:notes?.trim()||x.notes||"",status:"harvested" as const}:x);
    const statuses=updatedItems.map(x=>x.status);
    const batchStatus:GrowingBatchStatus=statuses.every(x=>x==="harvested"||x==="failed")?"completed":statuses.some(x=>x==="harvested")?"partially_harvested":latest.status;
    transaction.update(productRef,{stockGrams:newStock,stock:newStock,status:product.status==="out_of_stock"&&newStock>0?"active":product.status,updatedAt:serverTimestamp()});
    transaction.update(batchRef,{items:updatedItems,status:batchStatus,updatedAt:serverTimestamp()});
    transaction.set(adjustmentRef,{productId:batchItem.productId,productName:batchItem.productName,type:"harvest",quantity:netUsableYieldGrams,unit:"g",previousStock,newStock,actualHarvestGrams:actualYieldGrams,wastageGrams,reason:`Harvested ${latest.batchNumber}`,growingBatchId:batch.id,growingBatchItemId:itemId,createdByUid:uid,createdByEmail:email??"",createdAt:serverTimestamp()});
  });
}
