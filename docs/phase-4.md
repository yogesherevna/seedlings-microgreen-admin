# Phase 4 — Customers + Orders

Phase 4 is cumulative from the corrected Phase 3 AdminLTE foundation.

## Customers

- Customer list backed by the existing `customers` collection
- Search by name/mobile/email/document ID
- Customer detail view
- Customer status (active/blocked)
- Addresses/auth UID visibility when present
- Admin-only Firestore access

The implementation is deliberately tolerant of existing customer documents so the mobile onboarding/customer collection can evolve without forcing a second customer collection.

## Orders

- Order list
- Search by order number, order ID, customer name/mobile
- Status filtering
- Order detail
- Item-level historical product name and unit price
- Subtotal, delivery fee, discount and total
- Payment status visibility
- Order status lifecycle
- Status history with admin UID/email, note and timestamp
- Transaction-protected status update to avoid overwriting a concurrent change

### Reorder pricing architecture

An order item stores its own `unitPrice` and `lineTotal`. Therefore an old order keeps its historical price even if the product price changes later. A future reorder must create a new order from the product's current price; it must not copy the old unit price as the new order price.

### Order lifecycle implemented in this phase

pending_payment → paid → confirmed → preparing → ready_for_handover → handed_to_delivery → out_for_delivery → delivered

Cancellation is allowed only before the order reaches a terminal state, subject to the transition rules in `types/order.ts`.

## Intentionally not implemented yet

- Customer-facing reorder UI
- Stock reservation/deduction triggered by order placement
- Delivery assignment/user workflow
- Delivery proof/location
- Payment gateway integration
- CMS
- Notifications
- Reports
- Granular admin roles

Those are handled in later phases. Stock mutation is kept separate from the Admin status transition so we do not accidentally double-deduct stock when the mobile order-placement flow is integrated.
