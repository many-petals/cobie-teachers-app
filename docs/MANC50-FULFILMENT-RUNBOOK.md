# MANC50 physical-pack fulfilment runbook

This runbook covers every paid MANC50 order from confirmed Stripe payment to delivery, issue resolution or refund. School delivery addresses are private operational data and must not be copied into outreach lists, analytics exports or browser-accessible tables.

## Source of truth

- A successful, verified £5 GBP Stripe Checkout session creates exactly one `manc50_orders` row and one `manc50_fulfilments` row.
- The school identity and delivery address come from the approved Edubase snapshot via DfE URN. They do not come from free-text checkout input.
- The private `get_manc50_fulfilment_queue()` RPC is the operational queue. Only the Supabase service role can execute it.
- The private `update_manc50_fulfilment(...)` RPC is the only supported way to change fulfilment status.

## Daily operating routine

1. Run the fulfilment queue and deal with `issue` and `replacement_pending` records first, then overdue `pending` or `preparing` records.
2. For a new order, confirm the school name, DfE URN and official address before packing. Do not send to a different address without verifying it independently with the school.
3. Move `pending` to `preparing` when packing starts.
4. Check the pack contents against the approved pilot pack, seal it, buy tracked postage and retain proof of posting.
5. Move `preparing` to `dispatched`. Carrier and tracking reference are mandatory.
6. Move `dispatched` to `delivered` only after carrier confirmation or confirmation from the school.

Dispatch is due within seven calendar days of payment. A record is overdue while still `pending` or `preparing` after `dispatch_due_at`.

## Allowed status transitions

| Current | Allowed next status |
|---|---|
| `pending` | `preparing`, `issue`, `cancelled`, `refunded` |
| `preparing` | `dispatched`, `issue`, `cancelled`, `refunded` |
| `dispatched` | `delivered`, `issue`, `refunded` |
| `delivered` | `issue`, `replacement_pending`, `refunded` |
| `issue` | `preparing`, `replacement_pending`, `cancelled`, `refunded` |
| `replacement_pending` | `replaced`, `issue`, `cancelled`, `refunded` |
| `replaced` | `delivered`, `issue`, `refunded` |
| `cancelled` | terminal |
| `refunded` | terminal |

Repeating the same status is allowed so a retry is idempotent. Invalid jumps are rejected by the database.

## Exceptions and recovery

- Wrong or uncertain address: set `issue` with issue type `address_verification`; contact the school using an independently verified school channel. Resume at `preparing` once confirmed.
- Returned or lost parcel: set `issue` with the carrier outcome and tracking reference, then `replacement_pending` if a replacement is approved.
- Replacement sent: retain the original tracking history in the issue notes, record the new carrier and tracking reference, then set `replaced`.
- Refund: update the Stripe payment and order status as part of the refund process, then set fulfilment to `refunded`. A refund must not leave an active entitlement; test this workflow before the first school rollout.
- Suspected duplicate payment or pack: pause fulfilment, do not dispatch, and reconcile Stripe session, order and entitlement IDs before changing status.

## Evidence required before Project 1 closes

- One controlled paid order produces exactly one order and one fulfilment record.
- The fulfilment queue shows the correct canonical school and delivery address.
- Invalid status jumps fail; dispatch without carrier/tracking fails.
- A valid `pending → preparing → dispatched → delivered` path succeeds.
- One simulated address issue and one simulated replacement path are recorded correctly.
- A delayed/replayed Stripe webhook does not create duplicate orders, packs or entitlements.
- Refund handling disables access and closes the physical fulfilment record consistently.
