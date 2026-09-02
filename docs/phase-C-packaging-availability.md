# Packaging & Fulfilment — Product Available Requirement

## Persistent Product Available list

The Product Available list is a persistent operational view and must not depend on the current unsaved packing worksheet.

For every Production Product:

**Product Available = Actual Produced − Individual Packaging − Packaging in Combo**

- **Actual Produced** = cumulative net usable grams recorded by harvested Growing Batch items (`actualYieldGrams`). Gross harvested grams are not used because only net usable grams enter loose Product stock.
- **Individual Packaging** = grams consumed by completed packaging records for Single Salable Products.
- **Packaging in Combo** = grams consumed by completed packaging records for Combo Salable Products.
- The result remains visible even when there are no current packing rows.
- Completed packaging history is the source for packaging consumption.
- The current worksheet is used only for the live "Available After Packaging" preview and is not included in the persistent Product Available list until Pack All succeeds.

## UI

- Packaging History is hidden by default behind a `Packaging History` button.
- Product Available is always visible at the end of the Packaging & Fulfilment page.
- The live worksheet preview remains separate as `Available After Packaging`.
