# Padelhive Backend ERD

```mermaid
erDiagram
  USER ||--o{ VENUE : owns
  USER ||--o{ VENUE_ADMIN : administers
  VENUE ||--o{ VENUE_ADMIN : has
  VENUE ||--o{ COURT : contains
  USER ||--o{ BOOKING : hosts
  VENUE ||--o{ BOOKING : receives
  COURT ||--o{ BOOKING : booked_for
  VOUCHER ||--o{ BOOKING : discounts
  BOOKING ||--o| PAYMENT : paid_by
  BOOKING ||--o{ INVITE : includes
  USER ||--o{ INVITE : invited_user
  BOOKING ||--o{ REFUND : refund_requests
  PAYMENT ||--o| REFUND : refunded_payment
```

## Relationship summary

- Users own venues, administer venues via VenueAdmin, host bookings, and receive invites.
- Venues contain courts and receive bookings.
- Courts are booked via bookings.
- Bookings can reference a voucher, have one payment, and multiple invites/refunds.
- Payments may have an optional refund record.
