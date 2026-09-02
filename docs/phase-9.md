# Phase 9 — Website CMS Foundation

Development phase continuing from Phase 8 runtime-fixed Admin.

This phase establishes a strict Seedlings website CMS shell using the approved V2 website as the source of truth. It does not create a generic page builder.

- Website CMS is separate from Products, Orders, Inventory, Delivery and other business modules.
- Website Pages are predefined and technical page identifiers are hidden/read-only.
- Homepage sections are fixed; no arbitrary add/delete/reorder.
- Hero Slider remains repeatable.
- Product-driven sections such as Featured Microgreens must consume Product flags rather than duplicate product records.
- Phase 10 will inspect the actual V2 HTML page-by-page and determine the exact editable fields.
- Phase 11 will implement those exact fields in the Admin CMS.
