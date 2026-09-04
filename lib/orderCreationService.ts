import { createRecord, sanitizeFirestoreData } from "./firestore";
import type { Customer } from "@/types/customer";
import type { SalesProduct } from "@/types/salesProduct";
import type { DeliveryCharge } from "@/types/deliveryCharge";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";

export async function createAdminOrder(args:{
  customer:Customer;
  items:{salableProduct:SalesProduct;quantity:number;imageUrl?:string}[];
  deliveryCharge?:DeliveryCharge|null;
  subscription?:{id:string;number?:string;deliveryNumber?:number;plan?:SubscriptionPlan|null};
  scheduledDeliveryDate?:string;
  notes?:string;
}) {
  if (!args.items.length) throw new Error("Add at least one item.");
  if (args.items.some(x=>!Number.isInteger(x.quantity)||x.quantity<1)) throw new Error("Item quantities must be at least 1.");

  const items=args.items.map(x=>({
    salableProductId:x.salableProduct.id,
    salableProductSku:x.salableProduct.sku||"",
    salableProductType:x.salableProduct.type,
    productId:x.salableProduct.id,
    productName:x.salableProduct.name,
    sellingOptionId:x.salableProduct.id,
    sellingOptionLabel:x.salableProduct.type==="multiple" ? "Combo" : (x.salableProduct.components[0] ? `${x.salableProduct.components[0].quantityGrams}g` : "Single"),
    weightGrams:x.salableProduct.components.reduce((n,c)=>n+Number(c.quantityGrams||0),0),
    quantity:x.quantity,
    unitPrice:Number(x.salableProduct.sellingPrice),
    lineTotal:Number(x.salableProduct.sellingPrice)*x.quantity,
    imageUrl:x.imageUrl||x.salableProduct.imageUrl||"",
  }));
  const subtotal=items.reduce((n,x)=>n+x.lineTotal,0);
  const deliveryFee=args.deliveryCharge?.mode==="free"?0:Number(args.deliveryCharge?.amount||0);
  const orderType=args.subscription?"subscription":"one_time";
  const orderNumber=`ORD-${Date.now().toString(36).toUpperCase()}`;
  return createRecord("orders", sanitizeFirestoreData({
    orderNumber, customerId:args.customer.id, customerName:args.customer.name||"",
    customerMobile:args.customer.mobileNumber||args.customer.phone||"",
    items, subtotal, deliveryFee, discount:0, total:subtotal+deliveryFee,
    currency:"INR", paymentStatus:"pending", status:"pending_payment",
    deliveryAddress:args.customer.addresses?.[0]||undefined,
    scheduledDeliveryDate:args.scheduledDeliveryDate||"",
    notes:args.notes||"",
    orderType,
    sourceSubscriptionId:args.subscription?.id||"",
    sourceSubscriptionDeliveryNumber:args.subscription?.deliveryNumber||0,
    subscriptionPlanId:args.subscription?.plan?.id||"",
    subscriptionPlanName:args.subscription?.plan?.name||"",
    subscriptionPlanFrequency:args.subscription?.plan?.frequency||"",
    deliveryChargeId:args.deliveryCharge?.id||"",
    deliveryChargeName:args.deliveryCharge?.name||"",
    deliveryChargeSnapshot:deliveryFee,
    packingStatus:"pending",
  } as Record<string,unknown>));
}
