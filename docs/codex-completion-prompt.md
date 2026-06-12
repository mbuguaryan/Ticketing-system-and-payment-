# Codex Completion Prompt — Men’s Conference 2026 Ticketing System

You are working in this repository:

```text
mbuguaryan/Ticketing-system-and-payment-
```

Build this as a focused **one-event ticketing system** for **Men’s Conference 2026 Live in Nairobi at KICC**, with both physical tickets and virtual tickets for attendees outside Kenya.

This is not a general events marketplace. Every page should support one conversion goal: sell Men’s Conference 2026 tickets.

## Business Context

```text
Event: Men’s Conference 2026 Live in Nairobi
Host: Keith Muoki
Venue: KICC, Nairobi, Kenya
Date: Saturday 15 August 2026
Physical Gates Open: 12PM EAT
Virtual Access: Zoom access coordinated through Calendly where needed
Enquiries: 0750 886 617
Main CTA: Book Now
Payment: Paystack
Ticket Delivery: QR ticket after payment confirmation
```

## Public Ticket Types

The frontend, Supabase database, and Paystack metadata must use these exact ticket codes:

```text
early-bird — Early Bird — KES 2,500 — Physical KICC access
two-men — 2 Men — KES 4,500 — Physical KICC access
five-men — 5 Men — KES 10,000 — Physical KICC access
virtual — Virtual Ticket — KES 2,500 — Zoom/online access for outside-Kenya buyers
```

Virtual ticket buyers are people outside Kenya, people unable to travel to Nairobi, or buyers who prefer online access. Do not remove physical ticketing while adding virtual ticketing. The system must support both.

## Frontend Requirements

Primary page:

```text
app/conference/men-conference-2026/page.tsx
```

Homepage:

```text
app/page.tsx
```

The homepage should show the same Men’s Conference conversion page.

Keep the conversion flow simple:

```text
Poster / Hero
Event details
Physical + Virtual ticket cards
Buyer details form
Terms checkbox
Book Now button
Payment reassurance
Calendly/Zoom note for virtual buyers
```

Poster path:

```text
public/mens-conference-poster.jpg
```

Use the current Men’s Conference poster artwork supplied by the project owner.

The page must be mobile-first and conversion-focused. It should feel similar to a clean ticket-buying flow: choose ticket, enter details, proceed to payment, receive ticket.

## Meta Pixel Requirement

The project owner will place the Meta Pixel code directly. Do not overcomplicate this with analytics abstractions.

Recommended events:

```text
PageView — global
ViewContent — Men’s Conference page viewed
InitiateCheckout — checkout started
Purchase — only after Paystack confirms successful payment and ticket is issued
```

Never fire `Purchase` on button click. Fire `Purchase` only after backend verification confirms Paystack success.

For virtual tickets, include useful Meta event parameters where possible:

```text
content_name: Men’s Conference 2026
content_type: event_ticket
content_category: physical_ticket OR virtual_ticket
currency: KES
value: final order amount
```

## Supabase Project

Use the Supabase project:

```text
tgxpamjfjieesoayxtrk
Project name: AI CHATBOT
```

Relevant migrations:

```text
supabase/migrations/202606120001_initial_ticketing_schema.sql
supabase/migrations/202606120002_single_event_ticket_types.sql
supabase/migrations/202606120003_add_virtual_ticket_calendly.sql
```

The database must keep these public ticket types visible:

```text
early-bird
two-men
five-men
virtual
```

The `virtual` ticket type must have:

```text
delivery_mode = virtual
includes_zoom = true
requires_scheduling = true
is_public = true
```

## Calendly + Zoom Requirements

Calendly is used to coordinate Zoom access/session details for virtual attendees. The current scheduling page is:

```text
app/schedule/page.tsx
```

Environment variables:

```env
NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL=
NEXT_PUBLIC_CALENDLY_GROUP_TICKET_URL=
NEXT_PUBLIC_CALENDLY_SUPPORT_URL=
CALENDLY_API_TOKEN=
CALENDLY_WEBHOOK_SIGNING_KEY=
ZOOM_MODE=calendly_zoom
```

For the first working version, direct Calendly links are acceptable. For the full version, connect Calendly webhook data to Supabase:

```text
calendly_schedules.invitee_uri
calendly_schedules.event_uri
calendly_schedules.invitee_email
calendly_schedules.invitee_name
calendly_schedules.scheduled_start_time
calendly_schedules.scheduled_end_time
calendly_schedules.zoom_join_url
```

After a buyer purchases a virtual ticket, the success flow should clearly show:

```text
Payment confirmed
Virtual ticket ready
Open Calendly/Zoom access instructions
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
13. If the ticket type is virtual, show Calendly/Zoom access instructions.
```

## Paystack Functions To Complete

Complete these functions:

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
Include order_id and ticket_type_code in Paystack metadata.
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
If the ticket type is virtual, return requires_scheduling = true and the Calendly virtual URL.
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
Virtual Zoom/Calendly access must only be shown after verified payment.
```

## Frontend Integration

Replace plain form POST behavior with a client checkout flow if needed:

```text
Submit form
POST to create-ticket-order
POST to initialize-paystack-payment
window.location.href = authorization_url
```

Create this component if necessary:

```text
app/components/ConferenceCheckoutForm.tsx
```

The form must send:

```text
buyer_full_name
buyer_email
buyer_phone
ticket_type_code
quantity
marketing_opt_in
```

Map frontend ticket IDs to Supabase ticket type codes exactly:

```text
early-bird
two-men
five-men
virtual
```

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
If ticket is virtual, show Calendly/Zoom access CTA.
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
Venue or Virtual Access
Date
Instructions
```

For virtual tickets, show:

```text
This is a virtual ticket.
Zoom/Calendly access details are provided after payment confirmation.
Open scheduling/access link.
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
Calendly schedules
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

NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL=
NEXT_PUBLIC_CALENDLY_GROUP_TICKET_URL=
NEXT_PUBLIC_CALENDLY_SUPPORT_URL=
CALENDLY_API_TOKEN=
CALENDLY_WEBHOOK_SIGNING_KEY=
ZOOM_MODE=calendly_zoom

NEXT_PUBLIC_META_PIXEL_ID=
```

Required in Supabase Edge Function secrets:

```env
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
PAYSTACK_CALLBACK_URL=
APP_BASE_URL=
CALENDLY_API_TOKEN=
CALENDLY_WEBHOOK_SIGNING_KEY=
```

## Acceptance Criteria

The system is complete when:

```text
A buyer can open the Men’s Conference page.
The buyer can choose Early Bird, 2 Men, 5 Men, or Virtual Ticket.
The buyer can enter name, email, phone, and quantity.
The system creates an order in Supabase.
The system initializes Paystack and redirects buyer to Paystack.
The callback verifies payment.
The order is marked paid only after Paystack confirms success.
QR tickets are generated after payment only.
Virtual buyers see Calendly/Zoom access instructions after payment.
The buyer can view the QR or virtual ticket.
Gate staff can verify and check in a valid physical ticket.
A used physical ticket cannot be checked in again.
Admin can export attendees and view virtual buyers separately.
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
/schedule
/payment/callback
/ticket/[ticketCode]
/verify-ticket
/admin
```

Do not add unnecessary complexity. This is a one-event conversion system for Men’s Conference 2026 with both physical KICC attendance and virtual access for people outside Kenya.
