# Phase 2 — Products + Inventory

## Delivered

- Product catalogue CRUD
- Product status
- Current price and optional compare-at price
- Category/unit
- Featured flag and sort order
- Product slug
- Multiple image URL field
- Opening stock
- Low-stock threshold
- Low-stock warning
- Stock adjustment workflow
- Atomic stock adjustment transaction
- Adjustment history
- Admin-only Firestore rules for products/inventory

## Important operational rule

Existing product stock is not edited directly after creation. Use Stock Adjustment so inventory history is retained.

## Current limitation

Image URLs are stored as an array. Actual image upload/media management can be added when the CMS/media architecture is finalized.

## Not yet implemented

- Product variants/weight matrix
- Order stock reservation/deduction
- Customer ordering
- Delivery
- CMS
- Payments
- Promotions
- Granular admin roles
- Production hardening

Those belong to later phases.
