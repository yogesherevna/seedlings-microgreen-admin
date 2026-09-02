# Phase B — Salable Product Master (Corrected)

## Locked business flow

The Admin menu is **Salable Products**.

The salable-product form starts with **Type**:
- Single
- Combo

### Single
1. Select an existing Production Product.
2. The product's existing configured price is fetched into the salable-product price field.
3. The admin can change that fetched price for the salable product.
4. Enter quantity in grams for one salable unit.

Example: Broccoli -> 200g -> default price ₹300 -> admin may change price.

### Combo
1. Click **Add Product**.
2. Each row selects an existing Production Product.
3. Each row has **Quantity (g)**.
4. Multiple rows can be added.
5. Duplicate production products are prevented.
6. Combo has its own editable selling price.

Inventory is not consumed in Phase B. Packaging/Fulfilment will resolve these components and consume actual usable stock later.


## Follow-up included with Phase D
For Single Salable Products, selecting a Production Product generates the Salable Product Name, SKU / Code and Slug. These fields remain editable; manually changed fields are not overwritten by later automatic generation.
