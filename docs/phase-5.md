# Phase 5 — Delivery Operations

## Delivered

- Delivery user management in Admin
- Active/inactive delivery users
- Delivery user Firebase Auth UID association
- Vehicle information
- Orders eligible for handover
- Admin assignment of an order to an active delivery user
- Assignment and handover recorded atomically with the order status
- Delivery assignment history
- Admin delivery operations view
- Admin-only Firestore rules for delivery users and assignments

## Architecture

Delivery is not a separate Admin application. Delivery users remain users of the planned shared mobile application. Admin manages the operational records here.

## Important boundary

The delivery mobile application's authentication, route/route-batch UI, live location, proof photo, and delivery-user status transitions are not implemented in this Admin phase. This phase establishes the Admin-side operational data model and handover point so the mobile app can consume it later.

## Handover rule

Only orders in `ready_for_handover` can be assigned. Assignment atomically moves the order to `handed_to_delivery` and creates a `deliveryAssignments` record.

## No duplicate stock deduction

This phase does not deduct inventory. Inventory/order stock reservation must be connected to the final order-placement workflow rather than deducted again during delivery handover.
