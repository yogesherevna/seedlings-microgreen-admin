# Phase E — Subscription & Delivery Charges

## Scope

Phase E adds the two business masters required by the roadmap:

1. Subscription Plan Master
2. Delivery Charges Master

These masters are configuration used by Orders and later Delivery Operations. Phase E does not introduce delivery-user operations, customer delivery execution, automatic order generation, or automatic packing.

## Subscription Plan Master

Supported frequencies for the current Phase 1 business model:
- Monthly
- Quarterly
- Half-Yearly
- Yearly

Each plan contains:
- Plan name
- Frequency
- Deliveries per term
- Plan price
- Delivery pricing mode
- Delivery charge when the mode is per-delivery
- Active/inactive status
- Description

The default delivery day for subscription delivery is Saturday and remains configurable at the subscription/order level when that workflow is implemented. Phase E does not create a separate delivery-day master.

Default deliveries per term shown by the current configuration UI are:
- Monthly: 4
- Quarterly: 12
- Half-Yearly: 24
- Yearly: 48

These defaults are editable configuration values, not hard-coded business restrictions.

## Delivery Charges Master

Delivery charges are configured separately for:
- One-time orders
- Subscriptions

A charge can be:
- Fixed/flat amount
- Free

The configured charge is used as configuration for the applicable order/subscription flow. Historical order/subscription values must be snapshotted when those operational records are created or changed; Phase E does not retroactively change historical records.

## Boundaries

Phase E must not:
- redesign Growing Batches;
- change Production Product stock logic;
- perform packaging or stock deduction;
- generate customer orders automatically;
- create a separate operational Subscription menu;
- introduce Delivery Operations before Phase F;
- introduce new business masters not required by this phase.

## Security

Subscription plans and delivery charges remain inside the existing Admin security boundary.
