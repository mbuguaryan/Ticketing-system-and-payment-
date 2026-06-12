# 2026 Men Conference Nairobi — Ticketing, Paystack, Calendly & Zoom System

A complete event ticketing and payment system for the **2026 Men Conference Nairobi**, hosted by **Keith Muoki / Kujua Point**.

The system is designed to sell physical and virtual tickets online, accept payments through **Paystack**, verify payments through Paystack webhooks/API verification, generate QR tickets after successful payment, guide buyers through an assistant, and use **Calendly + Zoom** for virtual access, group-ticket planning, and ticket support sessions.

## Project Goal

Build a production-ready platform that can:

- Sell event tickets online
- Sell in-person and virtual access
- Accept card, mobile money, bank, and other supported Paystack payment channels
- Create a pending order before payment
- Initialize a Paystack checkout session from the backend
- Verify successful payment before ticket generation
- Generate unique QR tickets after confirmed payment
- Guide buyers through an AI-style ticketing assistant
- Direct virtual buyers to Calendly/Zoom scheduling after payment
- Prevent fake, duplicate, or reused tickets
- Provide an admin dashboard for orders, tickets, payments, schedules, and reports
- Provide a mobile-first gate scanner for event staff
- Keep manual bank/PesaLink transfer available only as a fallback option

## Core Stack

- **Frontend:** Next.js on Vercel
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Backend:** Supabase Edge Functions / Next.js API routes
- **Payments:** Paystack
- **Scheduling:** Calendly
- **Virtual Sessions:** Zoom via Calendly Zoom integration
- **Assistant:** Ticketing assistant API and frontend widget
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

## Scheduling Strategy

Calendly will be used for scheduling because it can handle buyer-selected time slots, confirmations, rescheduling, cancellation flows, and Zoom meeting generation once Zoom is connected inside Calendly.

Primary scheduling architecture:

1. `calendly_virtual_event_url`
2. `calendly_group_ticket_url`
3. `calendly_support_url`
4. `calendly_webhook`
5. `zoom_join_url_storage`

For the first version, the app links buyers to the right Calendly event type after payment. In the database phase, Calendly webhook data will be stored against the order so admin can see the invitee, scheduled event, and Zoom join link.

## Assistant Strategy

The system includes a ticketing assistant that helps buyers with:

- Early Bird physical ticket selection
- Virtual ticket selection
- Paystack payment guidance
- Group ticket direction
- Zoom and scheduling guidance
- QR ticket support
- Redirecting buyers to checkout or scheduling pages

The first version uses deterministic assistant logic. Later, it can be upgraded to a full LLM chatbot with order lookup, buyer support, and admin escalation.

## Paystack Flow

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
12. If the ticket requires scheduling, the buyer is directed to Calendly.

## Important Payment Rules

- Never expose the Paystack secret key on the frontend.
- All Paystack initialization must happen on the server.
- A callback redirect alone is not enough proof of payment.
- Always verify the transaction before delivering tickets.
- Always confirm that the paid amount matches the order amount.
- Always store Paystack references and raw webhook payloads in `payment_logs`.
- Do not generate tickets for unpaid or unverified orders.

## Main User Flow

1. Visitor opens the Men Conference ticket page.
2. Visitor asks the assistant for help or selects a ticket directly.
3. Visitor selects physical or virtual ticket type.
4. Visitor enters full name, phone, email, and quantity.
5. System creates a pending order.
6. System redirects buyer to Paystack checkout.
7. Buyer completes payment.
8. Paystack redirects buyer back to the website.
9. System verifies the transaction.
10. System marks order as paid.
11. System generates QR ticket(s).
12. Virtual and group-ticket buyers are directed to Calendly/Zoom scheduling.
13. Buyer receives or views the ticket.
14. Gate staff scans QR code at entry.
15. System validates and checks in the attendee.

## Ticket Types

Initial ticket types:

| Ticket Type | Price | Notes |
|---|---:|---|
| Early Bird Physical Ticket | KES 2,500 | In-person access at KICC |
| Virtual Ticket | KES 2,500 | Online access through Zoom |
| VIP | KES 5,000 | Priority physical access |
| Group Ticket | Custom | Churches, teams, organizations |
| Sponsor Pass | Free / Manual | Admin-created only |

## Planned Pages

### Public Pages

- `/conference/men-conference-2026`
- `/checkout`
- `/payment/[orderId]`
- `/payment/callback`
- `/schedule`
- `/ticket/[ticketCode]`
- `/verify-ticket`

### Assistant Pages / APIs

- `/api/assistant/ticketing`
- `TicketingAssistant` component on the public ticket page

### Admin Pages

- `/admin`
- `/admin/orders`
- `/admin/tickets`
- `/admin/payments`
- `/admin/schedules`
- `/admin/manual-confirmation`
- `/admin/checkin`
- `/admin/reports`

## Planned Backend Functions / API Routes

- `create-ticket-order`
- `initialize-paystack-payment`
- `verify-paystack-payment`
- `paystack-webhook`
- `ticketing-assistant`
- `calendly-webhook`
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

NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL=https://calendly.com/keithmuoki
NEXT_PUBLIC_CALENDLY_GROUP_TICKET_URL=https://calendly.com/keithmuoki
NEXT_PUBLIC_CALENDLY_SUPPORT_URL=https://calendly.com/keithmuoki
CALENDLY_API_TOKEN=
CALENDLY_WEBHOOK_SIGNING_KEY=

ZOOM_MODE=calendly_zoom
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

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

### Phase 1 — Working Paystack Ticketing + Assistant

- Ticket type configuration
- Checkout page
- Assistant widget
- Assistant API
- Paystack transaction initialization
- Paystack callback verification
- Paystack webhook handling
- QR ticket generation after verified payment
- Ticket display page
- Gate scanner page
- Calendly scheduling page

### Phase 2 — Supabase Persistence

- Supabase database schema
- Event and ticket type seed data
- Persist order before Paystack redirect
- Match Paystack reference to order
- Store payment logs
- Store ticket records
- Store Calendly/Zoom scheduling records

### Phase 3 — Admin Operations

- Orders dashboard
- Tickets dashboard
- Payment logs
- Schedule logs
- Manual ticket creation
- Manual transfer fallback confirmation
- Attendee exports
- Revenue summaries

### Phase 4 — Payment and Scheduling Hardening

- Paystack webhook signature verification
- Calendly webhook verification
- Duplicate webhook protection
- Transaction reference matching
- Amount and currency validation
- Failed/abandoned payment handling
- Refund status tracking
- Zoom join link storage

### Phase 5 — Growth Systems

- SMS reminders
- WhatsApp reminders
- Email ticket delivery
- Coupon codes
- Group leader ticket tracking
- Referral tracking
- Full LLM chatbot support

## Acceptance Criteria

The system is ready when:

- A buyer can use the assistant to choose the right ticket.
- A buyer can create a ticket order.
- The system can initialize a Paystack payment.
- The buyer can complete payment through Paystack.
- The backend can verify payment through Paystack.
- Tickets are generated only after verified payment.
- Virtual buyers can access Calendly/Zoom scheduling.
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
- Store Calendly schedule data against the order.
- Use Calendly Zoom integration first before building direct Zoom API automation.
- Use RLS policies for admin, finance, gate staff, and public access.
- Use a payment-provider abstraction so Paystack can be extended or changed later without rewriting the app.
- Make the gate scanner mobile-first.
- Make admin views simple, fast, and operational.

## Repository

```text
mbuguaryan/Ticketing-system-and-payment-
```
