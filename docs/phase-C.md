# Phase C — Packaging & Fulfilment

## Business flow

Packaging is a manual multi-line worksheet. The admin can add multiple Salable Products in one operation. Each row contains:

- Salable Product (selected from existing active Salable Products)
- Box Gms
- Quantity

The screen shows the Production Product stock impact before saving:

- Required Gms
- Available Gms
- Remaining Gms

A Salable Product's Box Gms must equal the sum of its existing component recipe quantities. A Single therefore uses its single component quantity; a Combo expands to all of its components. No proportional or other inferred allocation is performed.

If multiple rows consume the same Production Product, their requirements are aggregated and one final Remaining Gms value is shown.

## Atomic save

On Pack All:

1. Re-read current Salable Products and Production Products in a Firestore transaction.
2. Revalidate every row.
3. Expand all Salable Product recipes and aggregate Production Product gram requirements.
4. Check every Production Product has sufficient loose stock.
5. If any product is short, nothing is changed.
6. Otherwise deduct all required loose grams, increase packed units for every Salable Product row, create inventory adjustments, and create packaging history records.

## Boundaries

- No order-based packing.
- No automatic packing.
- No subscription-order generation.
- No Growing Batch redesign.
- Product stock remains loose grams.
- Salable Product packed stock remains packed units/boxes.
- Orders are not required to perform manual packaging.
