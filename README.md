# 2026 Men Conference Nairobi — Ticketing & Paystack Payment System

A complete event ticketing and payment system for the **2026 Men Conference Nairobi**, hosted by **Keith Muoki / Kujua Point**.

The system is designed to sell tickets online, accept payments through **Paystack**, verify payments through Paystack webhooks/API verification, generate QR tickets after successful payment, and support fast gate check-in.

## Project Goal

Build a production-ready platform that can:

- Sell event tickets online
- Accept card, mobile money, bank, and other supported Paystack payment channels
- Create a pending order before payment
- Initialize a Paystack checkout session from the backend
- Verify successful payment before ticket generation
- Generate unique QR tickets after confirmed payment
- Prevent fake, duplicate, or reused tickets
- Provide an admin dashboard for orders, tickets, payments, and reports
- Provide a mobile-first gate scanner for event staff
- Keep manual bank/PesaLink transfer available only as a fallback option

## Core Stack

- **Frontend:** Next.js on Vercel
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Backend:** Supabase Edge Functions / Next.js API routes
- **Payments:** Paystack
- **Fallback Payments:** Manual bank/PesaLink transfer
- **Ticketing:** Unique secure QR codes
- **Deployment:** Vercel + Supabase

## Payment Strategy

The system will use **Paystack as the primary payment method** because it provides a cleaner API-driven payment flow, transaction references, webhook events, and easier reconciliation than manual payment confirmation.

Primary payment architecture:

1. `paystack_checkout`
2. `paystack_transaction_verify`
3. `paystack_webhook`
4. `manual_bank_transfer_fallback`

### Paystack Flow

1. Buyer selects a ticket type and quantity.
2. System creates a pending order in the database.
3. Backend initializes a Paystack transaction using the buyer email, amount, unique order reference, and callback URL.
4. Buyer completes payment through Paystack checkout.
5. Paystack redirects buyer back to the website.
6. Backend verifies the transaction status using Paystack's verify endpoint.
7. Paystack webhook also listens for `charge.success` events.
8. System confirms the amount, currency, order reference, and payment status.
9. If valid, the order is marked as paid.
10. Tickets are generated only after payment is verified.
11. Buyer receives/views QR ticket(s).

### Important Payment Rules

- Never expose the Paystack secret key on the frontend.
- All Paystack initialization must happen on the server.
- A callback redirect alone is not enough proof of payment.
- Always verify the transaction before delivering tickets.
- Always confirm that the paid amount matches the order amount.
- Always store Paystack references and raw webhook payloads in `payment_logs`.
- Do not generate tickets for unpaid or unverified orders.

## Main User Flow

1. Visitor opens the Men Conference ticket page.
2. Visitor selects ticket type.
3. Visitor enters full name, phone, email, and quantity.
4. System creates a pending order.
5. System redirects buyer to Paystack checkout.
6. Buyer completes payment.
7. Paystack redirects buyer back to the website.
8. System verifies the transaction.
9. System marks order as paid.
10. System generates QR ticket(s).
11. Buyer receives or views the ticket.
12. Gate staff scans QR code at entry.
13. System validates and checks in the attendee.

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
- `/payment/callback`
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

## Planned Backend Functions / API Routes

- `create-ticket-order`
- `initialize-paystack-payment`
- `verify-paystack-payment`
- `paystack-webhook`
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

PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback

MANUAL_TRANSFER_ENABLED=true
MANUAL_BANK_NAME=
MANUAL_ACCOUNT_NAME=Kujua Point Limited
MANUAL_ACCOUNT_NUMBER=
MANUAL_BRANCH=
MANUAL_SUPPORT_PHONE=

TICKET_QR_SECRET=
APP_BASE_URL=http://localhost:3000
```

## Build Phases

### Phase 1 — Working Paystack Ticketing

- Supabase database schema
- Event and ticket type seed data
- Checkout page
- Paystack transaction initialization
- Paystack callback verification
- Paystack webhook handling
- QR ticket generation after verified payment
- Ticket display page
- Gate scanner page

### Phase 2 — Admin Operations

- Orders dashboard
- Tickets dashboard
- Payment logs
- Manual ticket creation
- Manual transfer fallback confirmation
- Attendee exports
- Revenue summaries

### Phase 3 — Payment Hardening

- Webhook signature verification
- Duplicate webhook protection
- Transaction reference matching
- Amount and currency validation
- Failed/abandoned payment handling
- Refund status tracking

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
- The system can initialize a Paystack payment.
- The buyer can complete payment through Paystack.
- The backend can verify payment through Paystack.
- Tickets are generated only after verified payment.
- Each QR ticket is unique and secure.
- Gate staff can scan and check in a ticket.
- A used ticket cannot be checked in again.
- Admin can export paid attendees.
- Finance can view payment data.
- Gate staff cannot view revenue.
- Manual transfer remains available only as a fallback.

## Development Notes

- Keep all ticket generation server-side.
- Do not generate tickets for unpaid orders.
- Do not trust frontend payment status.
- Verify Paystack transactions server-side before issuing tickets.
- Store raw Paystack webhook payloads in `payment_logs`.
- Use RLS policies for admin, finance, gate staff, and public access.
- Use a payment-provider abstraction so Paystack can be extended or changed later without rewriting the app.
- Make the gate scanner mobile-first.
- Make admin views simple, fast, and operational.

## Repository

```text
mbuguaryan/Ticketing-system-and-payment-
```
