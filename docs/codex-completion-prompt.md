# Codex Completion Prompt — Men’s Conference 2026 Ticketing System

You are working in the repository:

```text
mbuguaryan/Ticketing-system-and-payment-
```

Build this as a focused one-event ticketing system for **Men’s Conference 2026 Live in Nairobi at KICC**. This is not a general events marketplace. The full website should focus on one conversion goal: sell tickets for Men’s Conference 2026.

## Current Business Requirements

Event:

```text
Name: Men’s Conference 2026 Live in Nairobi
Host: Keith Muoki
Venue: KICC, Nairobi, Kenya
Date: Saturday 15 August 2026
Gates Open: 12PM
Enquiries: 0750 886 617
Main CTA: Book Now
Payment: Paystack
Ticket Delivery: QR ticket after payment confirmation
```

Public ticket types:

```text
Early Bird — KES 2,500
2 Men — KES 4,500
5 Men — KES 10,000
```

Do not show virtual ticketing on the main conversion page unless explicitly reintroduced later. The current advertising focus is the physical event at KICC.

## Frontend Requirements

The current page is:

```text
app/conference/men-conference-2026/page.tsx
```

The homepage should show the same conversion page:

```text
app/page.tsx
```

Keep the page structure simple:

```text
Poster / Hero
Event details
Ticket cards
Buyer details form
Terms checkbox
Book Now button
Payment reassurance
```

The poster should be placed at:

```text
public/mens-conference-poster.jpg
```

Use the current poster artwork supplied by the project owner.

Make the page mobile-first and conversion-focused. The design should feel close to TicketSasa’s buying experience: choose ticket quantity, enter details, proceed to payment, receive ticket.

## Meta Pixel Requirement

The project owner will place the Meta Pixel code directly. Do not overcomplicate this with a third-party analytics abstraction.

Recommended events:

```text
PageView — global
ViewContent — Men’s Conference page viewed
InitiateCheckout — Book Now / checkout started
Purchase — only after Paystack confirms successful payment and ticket is issued
```

Important: never fire `Purchase` on button click. Fire `Purchase` only after backend verification confirms Paystack success.

## Supabase Project

Use the Supabase project:

```text
tgxpamjfjieesoayxtrk
Project name: AI CHATBOT
```

The repository already contains migrations. Apply them if they are not already applied:

```text
supabase/migrations/202606120001_initial_ticketing_schema.sql
supabase/migrations/202606120002_single_event_ticket_types.sql
```

The public database ticket type codes must match the frontend exactly:

```text
early-bird
two-men
five-men
```

## Edge Functions Already Created

These Edge Functions already exist in Supabase:

```text
ticketing-assistant
create-ticket-order
verify-ticket
checkin-ticket
calendly-webhook
create-manual-ticket
export-attendees
resend-ticket
verify-paystack-payment
initialize-paystack-payment
paystack-webhook
confirm-manual-payment
```

Some Paystack functions were deployed as placeholders/stubs. Replace them with full working code.

## Required Paystack Flow

Implement this exact payment flow:

```text
1. Buyer fills the ticket form.
2. Frontend calls create-ticket-order.
3. Supabase creates ticket_orders and ticket_order_items.
4. Frontend calls initialize-paystack-payment with order_id.
5. Edge Function initializes Paystack transaction server-side.
6. Store payment_reference, payment_access_code, and payment_authorization_url on ticket_orders.
7. Redirect buyer to Paystack authorization_url.
8. Paystack redirects buyer to /payment/callback?reference=...
9. Callback verifies payment server-side.
10. If Paystack status is success and amount/currency/reference match the order, mark order as paid.
11. Call issue_tickets_for_order(order_id).
12. Redirect/show QR ticket page.
```

## Paystack Functions To Complete

Complete:

```text
initialize-paystack-payment
verify-paystack-payment
paystack-webhook
```

### initialize-paystack-payment

Input:

```json
{ "order_id": "uuid" }
```

Steps:

```text
Fetch ticket_orders by order_id.
Reject if order is not pending/payment_initialized.
Create or reuse payment_reference.
Call Paystack transaction initialize endpoint.
Use amount_kes * 100.
Currency must be KES.
Callback URL must come from PAYSTACK_CALLBACK_URL.
Store Paystack access_code and authorization_url.
Insert payment_logs row.
Return authorization_url, access_code, reference, order_id.
```

### verify-paystack-payment

Input:

```json
{ "reference": "paystack_reference" }
```

Steps:

```text
Fetch Paystack transaction verification by reference.
Find ticket_orders by payment_reference.
Validate transaction status = success.
Validate paid amount equals order.amount_kes * 100.
Validate currency = KES.
Mark order as paid.
Insert payment_logs row.
Call issue_tickets_for_order(order_id).
Return order and tickets.
```

### paystack-webhook

Steps:

```text
Read raw body.
Verify x-paystack-signature using PAYSTACK_WEBHOOK_SECRET.
Store payload in webhook_events.
For charge.success events, verify reference against Paystack or validate payload carefully.
Find matching order by payment_reference.
Validate amount and currency.
Mark order as paid.
Call issue_tickets_for_order(order_id).
Make the function idempotent so duplicate webhooks do not create duplicate tickets.
```

## Security Rules

```text
Never expose PAYSTACK_SECRET_KEY to the browser.
Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
Do not trust frontend payment status.
Do not generate tickets before payment is verified.
Do not mark orders paid without matching amount and currency.
Webhook processing must be idempotent.
Gate check-in must not allow reused tickets.
```

## Frontend Integration

Replace the current plain form POST behavior with a client checkout flow if needed:

```text
Submit form
POST to create-ticket-order
POST to initialize-paystack-payment
window.location.href = authorization_url
```

Create a client component if necessary:

```text
app/components/ConferenceCheckoutForm.tsx
```

Keep the UI simple and similar to the current server-rendered page.

## Payment Callback Page

Update:

```text
app/payment/callback/page.tsx
```

It should:

```text
Read reference from searchParams.
Call verify-paystack-payment.
If success, show payment confirmed and link to ticket.
If failed, show a helpful failure message and link back to the event page.
Fire Meta Purchase only after verified success if Meta Pixel is present.
```

## Ticket Page

Update:

```text
app/ticket/[ticketCode]/page.tsx
```

It should display:

```text
Event name
Ticket type
Holder name
Ticket code
QR code
Venue
Date
Instructions: present this at the gate
```

## Verification Page

Update:

```text
app/verify-ticket/page.tsx
```

It should support:

```text
Manual code entry
QR scan later if scanner package is added
Status display: valid, checked_in, cancelled, not found
Check-in action for authorized gate staff only
```

## Admin Requirements

Keep admin simple:

```text
Orders
Tickets
Payment logs
Check-in logs
Attendee export
```

Functions requiring staff access must keep `verify_jwt=true`.

## Environment Variables

Required in local `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tgxpamjfjieesoayxtrk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback
APP_BASE_URL=http://localhost:3000

NEXT_PUBLIC_META_PIXEL_ID=
```

Required in Supabase Edge Function secrets:

```env
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
PAYSTACK_CALLBACK_URL=
APP_BASE_URL=
```

## Acceptance Criteria

The system is complete when:

```text
A buyer can open the Men’s Conference page.
The buyer can choose Early Bird, 2 Men, or 5 Men.
The buyer can enter name, email, phone, and quantity.
The system creates an order in Supabase.
The system initializes Paystack and redirects buyer to Paystack.
The callback verifies payment.
The order is marked paid only after Paystack confirms success.
QR tickets are generated after payment only.
The buyer can view the QR ticket.
Gate staff can verify and check in a valid ticket.
A used ticket cannot be checked in again.
Admin can export attendees.
The page is mobile-friendly.
Meta Pixel purchase tracking fires only after verified payment.
```

## Final Checks

Run locally:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then test:

```text
/conference/men-conference-2026
/payment/callback
/ticket/[ticketCode]
/verify-ticket
/admin
```

Do not add unnecessary complexity. This is a one-event conversion system for Men’s Conference 2026.
