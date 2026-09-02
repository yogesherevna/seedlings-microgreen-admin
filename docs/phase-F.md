# Phase F — Delivery Operations

## Scope

Phase F implements the operational delivery workflow already defined by the roadmap:

1. Delivery users
2. Order assignment
3. Handover
4. Delivery status updates

## Delivery Users

Admin can create, edit, activate, and deactivate delivery-user profiles. A delivery user profile is linked to an existing Firebase Authentication UID.

Required profile information:
- Name
- Mobile number
- Firebase Auth UID

Optional:
- Email
- Vehicle type
- Vehicle number

Only active delivery users can receive new assignments.

## Assignment and Handover

Orders eligible for delivery are shown in Delivery Operations when their order status is:
- ready_for_handover
- handed_to_delivery
- out_for_delivery

An order in `ready_for_handover` can be assigned to an active delivery user. Assignment and handover are performed atomically:
- delivery assignment is created;
- the order records the delivery user;
- order status becomes `handed_to_delivery`;
- order status history records the handover.

## Delivery Status

A delivery assignment supports:
- assigned
- accepted
- picked_up
- out_for_delivery
- delivered
- failed
- cancelled

The Delivery Operations UI provides operational progression for the current admin workflow, including Accept, Out for delivery, and Delivered. Assignment status updates also keep the related order status synchronized where the roadmap's order lifecycle has a corresponding state.

## Boundaries

Phase F does not:
- redesign Orders;
- redesign Packaging & Fulfilment;
- create automatic packing;
- generate subscription orders;
- introduce new business masters;
- implement customer-side delivery execution;
- introduce Reports & Forecasting.

## Security

Delivery users, assignments, and order delivery operations remain inside the existing Admin security boundary.
