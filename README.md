# 2026 Men Conference Nairobi — Ticketing & PesaLink Payment System

A complete event ticketing and payment system for the **2026 Men Conference Nairobi**, hosted by **Keith Muoki / Kujua Point**.

The system is designed to sell tickets, collect PesaLink payments, verify payments, generate QR tickets, and support fast gate check-in.

## Project Goal

Build a production-ready platform that can:

- Sell event tickets online
- Accept PesaLink / bank-transfer payments
- Support manual payment confirmation first
- Upgrade later to automated PesaLink provider confirmation
- Generate unique QR tickets after payment confirmation
- Prevent fake, duplicate, or reused tickets
- Provide an admin dashboard for orders, tickets, payments, and reports
- Provide a mobile-first gate scanner for event staff

## Core Stack

- **Frontend:** Next.js on Vercel
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Backend:** Supabase Edge Functions
- **Payments:** PesaLink provider abstraction
- **Ticketing:** Unique secure QR codes
- **Deployment:** Vercel + Supabase

## Payment Strategy

The system starts with **manual PesaLink confirmation**, because final PesaLink automation depends on the selected bank, payment gateway, or provider API.

Supported provider architecture:

1. `manual_pesalink`
2. `paystack_pesalink`
3. `bank_api_pesalink`
4. `pesawise_pesalink`

This keeps the system usable immediately while allowing automatic confirmations later.

## Main User Flow

1. Visitor opens the Men Conference ticket page.
2. Visitor selects ticket type.
3. Visitor enters full name, phone, email, and quantity.
4. System creates a pending order.
5. System displays PesaLink payment instructions.
6. Buyer completes payment through bank / PesaLink.
7. Admin or finance confirms the payment.
8. System marks order as paid.
9. System generates QR ticket(s).
10. Buyer receives or views the ticket.
11. Gate staff scans QR code at entry.
12. System validates and checks in the attendee.

## Ticket Types

Initial ticket types:

| Ticket Type | Price | Notes |
|---|---:|---|
| Early Bird | KES 1,000 | Limited offer |
| Regular | KES 1,500 | Standard ticket |
| VIP | KES 3,000 | Priority access |
| Group Ticket | Custom | Churches, teams, organizations |
| Sponsor Pass | Free / Manual | Admin-created only |

## Planned Pages

### Public Pages

- `/conference/men-conference-2026`
- `/checkout`
- `/payment/[orderId]`
- `/ticket/[ticketCode]`
- `/verify-ticket`

### Admin Pages

- `/admin`
- `/admin/orders`
- `/admin/tickets`
- `/admin/payments`
- `/admin/manual-confirmation`
- `/admin/checkin`
- `/admin/reports`

## Planned Supabase Edge Functions

- `create-ticket-order`
- `initialize-pesalink-payment`
- `pesalink-webhook`
- `confirm-manual-payment`
- `generate-order-tickets`
- `verify-ticket`
- `checkin-ticket`
- `resend-ticket`
- `create-manual-ticket`
- `export-attendees`

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PESALINK_PROVIDER=manual_pesalink
PESALINK_BANK_NAME=
PESALINK_ACCOUNT_NAME=Kujua Point Limited
PESALINK_ACCOUNT_NUMBER=
PESALINK_BRANCH=
PESALINK_SUPPORT_PHONE=

PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=

PESAWISE_API_KEY=
PESAWISE_WEBHOOK_SECRET=

TICKET_QR_SECRET=
APP_BASE_URL=http://localhost:3000
```

## Build Phases

### Phase 1 — Working Manual Ticketing

- Supabase database schema
- Event and ticket type seed data
- Checkout page
- Manual PesaLink payment instructions
- Admin manual payment confirmation
- QR ticket generation
- Ticket display page
- Gate scanner page

### Phase 2 — Admin Operations

- Orders dashboard
- Tickets dashboard
- Payment logs
- Manual ticket creation
- Attendee exports
- Revenue summaries

### Phase 3 — Payment Automation

- Provider adapters
- PesaLink webhook handling
- Paystack PesaLink option
- Bank API option
- Automated order matching

### Phase 4 — Growth Systems

- SMS reminders
- WhatsApp reminders
- Email ticket delivery
- Coupon codes
- Group leader ticket tracking
- Referral tracking

## Acceptance Criteria

The system is ready when:

- A buyer can create a ticket order.
- The system shows clear PesaLink payment instructions.
- Admin can confirm a payment manually.
- Tickets are generated only after payment confirmation.
- Each QR ticket is unique and secure.
- Gate staff can scan and check in a ticket.
- A used ticket cannot be checked in again.
- Admin can export paid attendees.
- Finance can view payment data.
- Gate staff cannot view revenue.

## Development Notes

- Keep all ticket generation server-side.
- Do not generate tickets for unpaid orders.
- Store raw payment payloads in `payment_logs`.
- Use RLS policies for admin, finance, gate staff, and public access.
- Use a payment-provider abstraction so PesaLink can be changed without rewriting the app.
- Make the gate scanner mobile-first.
- Make admin views simple, fast, and operational.

## Repository

```text
mbuguaryan/Ticketing-system-and-payment-
```
