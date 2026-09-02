# Phase B — Sales Product Master

## Purpose
Sales Products are the commerce layer. They define what customers can buy using existing Production Products as components.

## Supported models
- Single: exactly one production product component.
- Multiple: two or more production product components (combo).

## Stored fields
- name, sku, slug
- description, shortDescription, imageUrl
- type
- components[] with production product reference/name/SKU and grams per saleable unit
- sellingPrice, currency
- oneTimePurchase, subscriptionPurchase
- active, featured, sortOrder

## Rules
- At least one purchase mode must be enabled.
- Component grams must be positive whole grams.
- A Single product has exactly one component.
- A Multiple product has at least two components.
- Duplicate production products in one sales product are not allowed.
- Production stock remains actual usable harvested grams.
- Packaging/packed stock is intentionally not implemented in Phase B; it belongs to Phase D.

## Menu
Products → Sales Products → Inventory → Growing Batches ...

## Security
`/salesProducts/{id}` is admin-only in Firestore rules, consistent with the Admin application security boundary.
