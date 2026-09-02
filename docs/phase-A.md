# Phase A — Production Product Master

## Scope

Phase A defines `products` as the Production Product Master: the things Seedlings grows.

### Production fields

- `growingActive`
- `growingCycleDays`
- `expectedYieldGramsPerTray`
- `minimumYieldGramsPerTray`
- `expectedLossGramsPerTray`
- `safetyStockGrams`

### Inventory rule

Current product stock is loose inventory in grams and represents **actual usable quantity** only.

`actual harvested grams - actual loss grams = actual usable grams added to stock`

Expected production is for planning/forecasting and is not current stock.

### Commerce boundary

Sales prices, pack definitions, and product combinations are intentionally not maintained in Product Master. They belong to Phase B — Sales Products.

### Compatibility

Legacy commerce fields may still exist on older Firestore product documents so that the current application remains operational while Phase B migrates commerce references to Sales Products. Phase A does not edit those fields.
