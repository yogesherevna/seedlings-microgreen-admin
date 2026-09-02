# Phase 13 — Final Admin CMS

This is the final planned development phase for `seedlings-admin` before the
separate `seedlings-web` project is built.

## Baseline
Continues directly from Phase 12. No rewrite and no new application.

## Final CMS rules
- Website CMS is strictly for the approved Seedlings website.
- Page selection uses predefined human-readable pages; technical keys are not
  editable by the administrator.
- Homepage sections are fixed. There is no generic section/page builder.
- Journey uses fixed V2 sections and fixed process steps.
- Hero Slider, Testimonials, FAQ and Blogs are repeatable because the website
  needs multiple records for those areas.
- Featured Microgreens is driven by the Product Featured flag; products are
  not duplicated in CMS.
- Navigation routes/order are developer-controlled.
- Website Settings controls predefined website-wide information.
- CMS does not manage orders, inventory, customers, delivery operations or
  authentication.

## Final development boundary

After this phase, the Admin CMS structure is considered locked. Any later
changes should be requirement-driven corrections, not generic CMS expansion.

The next application is `seedlings-web`, which will consume the Firebase data
managed by this Admin.
