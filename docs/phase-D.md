# Phase D — Orders

## Scope

Phase D implements the existing **Order Master** as the order-management layer and changes order item selection to use **Salable Products**, not raw Production Products.

## Included

- Existing Order Master list.
- Search by order number/order ID/customer/subscription information.
- One-time and subscription order classification.
- Admin-created order on behalf of a customer.
- Customer selection from the existing `customers` collection.
- Salable Product selection from the existing `salesProducts` collection.
- Salable Product selling price is snapshotted into the order item at order creation.
- Salable Product identity/SKU/type is retained on the order item.
- Salable Product component composition is displayed when creating an order.
- Existing customer subscription source is retained for subscription orders.
- Existing delivery-charge selection is retained from configured delivery charges.
- Scheduled delivery date and notes.
- Existing order status lifecycle and status history.
- Existing payment/transaction details.
- Existing refund action for successfully paid orders.
- Existing customer/order detail visibility.

## Salable Product naming addition included with this delivery

For a **Single** Salable Product, selecting the existing Production Product now generates:

- Salable Product Name
- SKU / Code
- Slug

The generated values are based on the selected product and configured quantity. They remain editable.

If the administrator manually changes the Name, SKU / Code, or Slug, that field is treated as manually controlled and subsequent automatic generation does not overwrite it.

Changing the Single quantity updates the generated Name/SKU/Slug only for fields that have not been manually changed.

## Pricing

Orders use the current `sellingPrice` of the selected Salable Product at the time the order is created. The order stores its own `unitPrice` and `lineTotal`, so later Salable Product price changes do not alter historical orders.

## Stock boundary

This phase does **not** invent a new stock-deduction or reservation rule. Packaging remains the manual Phase C operation. No automatic order packing is introduced.

## Not included

- Subscription Master redesign.
- Delivery Charge Master redesign.
- Delivery assignment/driver workflow.
- Delivery proof/location.
- Payment gateway integration.
- Notifications.
- Reports/forecasting.
- Growing Batch redesign.
- Automatic customer-order packing.
- New business modules outside the established roadmap.
