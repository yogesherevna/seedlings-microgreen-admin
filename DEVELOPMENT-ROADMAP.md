# Seedlings Admin — Authoritative Development Roadmap

This file is the source-code roadmap for the current business-aligned Admin development.

## Non-negotiable development rule

Business requirements are provided incrementally. The implementation must stay aligned to the business goal and must not introduce unrelated modules, duplicate masters, or technical phases that divert the workflow.

When a new requirement is provided, determine the required data model, UI, validation, authorization, security, state transitions, history/audit, and impact on existing modules — but do not change an already-decided business relationship unless the requirement explicitly changes it.

## Completed

### Phase A — Products / Production Product Master
- Products represent what Seedlings grows.
- Growing configuration belongs to Products.
- Current loose production stock is actual usable harvested grams.
- Expected production is not current stock.

### Phase B — Salable Products
- Admin menu name is **Salable Products**.
- A Salable Product is either Single or Combo.
- Single references exactly one existing Production Product.
- Combo references multiple existing Production Products.
- Component quantity is stored in grams.
- Single price can be fetched from the existing Product price and remains editable for the Salable Product.
- Salable Product Name is entered by Admin.
- SKU / Code and Slug auto-generate from the name and remain editable. Once manually edited, name changes do not overwrite the custom value.

## Current phase

### Phase C — Packaging & Fulfilment — corrected implementation

Packaging is a **manual Admin operation**, independent of customer orders.

Admin selects an existing Salable Product and enters the number of packed units/boxes to prepare.

The Salable Product components determine the gram consumption:

```text
Salable Product
      ↓
component grams per pack × quantity to pack
      ↓
consume actual loose Product stock
      ↓
increase Salable Product packed stock (units/boxes)
```

Example:

```text
Actual Broccoli stock = 2,700 g
Salable Product = Broccoli 200g
Quantity to pack = 10

Consume = 2,000 g
Remaining loose stock = 700 g
Packed Salable Product stock = 10 units
```

For a combo, every component is consumed atomically. If any component does not have enough actual stock, the entire packaging transaction fails and no component is partially deducted.

Phase C must:
- use existing Production Products through the existing Salable Product definition;
- consume only actual loose gram stock;
- prevent negative production stock;
- increase packed Salable Product quantity in units/boxes;
- record packaging history and inventory adjustments;
- remain independent of Orders and Subscriptions;
- keep all business collections behind the existing Admin security boundary.

Phase C must not:
- create or modify Growing Batch relationships;
- create new Production Products;
- create Salable Products during packaging;
- generate packing work from Orders;
- automatically pack customer orders;
- deduct expected/future production;
- introduce a separate packaging master unless a later business requirement explicitly calls for one.

## Remaining phases

### Phase D — Orders — completed
Customer orders, Admin-created orders, one-time/subscription order handling, payment/transaction details, and refund handling.

Orders reference Salable Products and snapshot the Salable Product selling price. Existing Order Master lifecycle/status/payment/refund behavior is retained. Automatic order packing or stock deduction is not introduced without an explicit business rule.

Orders reference Salable Products. Orders do not redefine Production Products.

### Phase E — Subscription & Delivery Charges — completed
Subscription Master and Delivery Charges Master.

Subscription frequencies for the current Phase 1 business model are Monthly, Quarterly, Half-Yearly, and Yearly. Delivery day defaults to Saturday and is configurable.

Phase E is configuration/master data only. It does not introduce Delivery Operations or automatic order generation/packing.

### Phase F — Delivery Operations — current
Delivery users, assignments, handover, delivery status, and related operational workflow.

See `docs/phase-F.md` for the Phase F implementation scope and boundaries.

### Phase G — Reports & Forecasting
Current actual stock plus expected future usable production after expected loss, compared with one-time/subscription demand and operational requirements.

Forecasting must never treat expected future production as current stock.

### Phase H — Final Integration & Security
Cross-module validation, security verification, business integrity checks, audit/history checks, regression testing, and release readiness.

## Existing modules that must not be unnecessarily rebuilt

Growing Batches already exists and is based on existing Production Products. It is not a new development phase in this roadmap. Preserve its established relationship and harvest logic.

The established harvest rule is:

```text
Actual Harvested - Actual Loss = Actual Usable
Actual Usable → Production Product loose stock
```

## Final Admin menu direction

1. Dashboard
2. Products
3. Salable Products
4. Growing Batches
5. Customers
6. Orders
7. Subscription & Delivery Charges
8. Delivery Operations
9. Packaging & Fulfilment
10. Website CMS
11. Reports

Other administrative/security screens may exist where technically required, but business navigation should not be expanded with duplicate operational masters without a requirement.
