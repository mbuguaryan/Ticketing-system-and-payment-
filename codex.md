# Codex Execution Brief — Men’s Conference 2026 Ticketing App

You are working in this repository:

```text
mbuguaryan/Ticketing-system-and-payment-
```

Build and harden the app as a focused one-event ticketing and payment system for **Men’s Conference 2026 Live in Nairobi at KICC**, with both physical tickets and virtual tickets for buyers outside Kenya.

This is not a general event marketplace. The whole product should support one conversion goal: sell and manage Men’s Conference 2026 tickets.

---

## 1. Current Business Context

```text
Event: Men’s Conference 2026 Live in Nairobi
Host: Keith Muoki
Venue: KICC, Nairobi, Kenya
Date: Saturday 15 August 2026
Physical Gates Open: 12PM EAT
Virtual Access: Zoom access coordinated through Calendly where needed
Enquiries: 0750 886 617
Main CTA: Book Now
Payment Provider: Paystack
Database: Supabase project AI CHATBOT
Ticket Delivery: QR ticket after verified payment
```

Supabase project:

```text
Project name: AI CHATBOT
Project ref: tgxpamjfjieesoayxtrk
Project URL: https://tgxpamjfjieesoayxtrk.supabase.co
```

---

## 2. Public Ticket Types

The frontend, Supabase database, Paystack metadata, and admin/export logic must use these exact ticket codes:

```text
early-bird — Early Bird — KES 2,500 — Physical KICC access
two-men — 2 Men — KES 4,500 — Physical KICC access
five-men — 5 Men — KES 10,000 — Physical KICC access
virtual — Virtual Ticket — KES 2,500 — Zoom/online access for outside-Kenya buyers
```

Virtual ticket buyers include people outside Kenya, people unable to travel to Nairobi, or buyers who prefer online access.

Do not remove physical ticketing while adding virtual ticketing. The system must support both.

---

## 3. Current App State

Important files already present:

```text
app/conference/men-conference-2026/page.tsx
app/page.tsx
app/payment/callback/page.tsx
app/ticket/[ticketCode]/page.tsx
app/verify-ticket/page.tsx
app/schedule/page.tsx
app/admin/page.tsx
app/api/paystack/initialize/route.ts
app/api/paystack/verify/route.ts
app/api/paystack/webhook/route.ts
lib/paystack.ts
lib/ticketing.ts
lib/ticket-types.ts
lib/checkout.ts
lib/supabase-admin.ts
lib/scheduling.ts
```

Current migrations:

```text
supabase/migrations/202606120001_initial_ticketing_schema.sql
supabase/migrations/202606120002_single_event_ticket_types.sql
supabase/migrations/202606120003_add_virtual_ticket_calendly.sql
supabase/migrations/202606120004_idempotent_ticket_issuing.sql
```

There is also a longer planning file:

```text
docs/codex-completion-prompt.md
```

Use this `codex.md` as the primary execution brief.

---

## 4. Do Not Touch These Decisions Unless Asked

```text
Keep one event only.
Keep Meta Pixel manual/direct — project owner will place it.
Keep Paystack as the payment provider.
Keep Supabase project ref: tgxpamjfjieesoayxtrk.
Keep KES as the payment currency.
Keep Calendly/Zoom for virtual access.
Keep physical KICC ticketing and virtual access on the same conversion page.
```

---

## 5. Environment Variables Required

Local `.env.local` must support:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tgxpamjfjieesoayxtrk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
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

TICKET_QR_SECRET=replace-with-a-long-random-secret
```

Production must use the deployed app URL for:

```text
APP_BASE_URL
PAYSTACK_CALLBACK_URL
Paystack webhook URL
Calendly webhook URL
```

Never expose these to the browser:

```text
SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY
PAYSTACK_WEBHOOK_SECRET
CALENDLY_API_TOKEN
CALENDLY_WEBHOOK_SIGNING_KEY
```

---

## 6. Immediate Priority: Make The Existing Flow Fully Launch-Ready

The intended production flow is:

```text
Buyer opens Men’s Conference page
Buyer chooses ticket type and quantity
Buyer enters name, email, phone
Buyer submits checkout form
Server creates Supabase order
Server creates Supabase order items
Server initializes Paystack transaction
Buyer completes Paystack payment
Paystack redirects to /payment/callback?reference=...
Callback verifies payment with Paystack
Server validates reference, amount, and currency
Server marks order paid
Server issues QR tickets idempotently
Buyer sees issued ticket page
Physical buyer presents QR at gate
Virtual buyer gets Calendly/Zoom access instructions
```

The code is partially implemented. Complete, harden, and test it.

---

## 7. Critical Task A — Fix and Harden Checkout

Review:

```text
app/api/paystack/initialize/route.ts
lib/ticketing.ts
lib/paystack.ts
lib/checkout.ts
```

Requirements:

```text
Create Supabase order before Paystack initialization.
Create ticket_order_items before Paystack redirect.
Use ticket type code exactly: early-bird, two-men, five-men, virtual.
Calculate amount server-side from Supabase ticket_types, not from browser data.
Reject invalid ticket types.
Reject quantity below 1 or above 20.
Store payment_reference, payment_access_code, and payment_authorization_url on ticket_orders.
Insert payment_logs row for transaction.initialize.
Pass order_id, ticket_type_code, delivery_mode, quantity, and amount in Paystack metadata.
Redirect only to Paystack authorization_url.
```

Acceptance checks:

```text
Submitting Early Bird creates one pending order and one order item.
Submitting Virtual Ticket creates one pending order and one order item with ticket type virtual.
Amount is correct for each ticket type and quantity.
No ticket is issued before payment verification.
```

---

## 8. Critical Task B — Fix and Harden Payment Callback

Review:

```text
app/payment/callback/page.tsx
lib/ticketing.ts
app/api/paystack/verify/route.ts
```

Requirements:

```text
Read reference from search params.
Call server-side Paystack verify.
Find order by ticket_orders.payment_reference.
Validate transaction.status === success.
Validate transaction.amount === order.amount_kes * 100.
Validate transaction.currency === KES.
Mark order as paid only after validation.
Set paid_at.
Call issue_tickets_for_order(order_id).
Fetch issued tickets.
Show ticket link.
For virtual ticket orders, show Calendly/Zoom access CTA.
If payment fails, show clear failure state and link back to checkout.
```

Important: Paystack verification must happen server-side only.

Acceptance checks:

```text
A successful Paystack test payment marks the order paid.
Wrong amount or currency fails the order.
Callback shows issued ticket link.
Virtual ticket callback shows schedule/Zoom CTA.
Refreshing callback does not create duplicate tickets.
```

---

## 9. Critical Task C — Complete Paystack Webhook Finalization

Review:

```text
app/api/paystack/webhook/route.ts
lib/ticketing.ts
```

The webhook was not fully completed in the previous pass. Complete it now.

Requirements:

```text
Read raw request body.
Verify x-paystack-signature with PAYSTACK_WEBHOOK_SECRET using HMAC SHA512.
Reject invalid signatures.
Parse event only after signature verification.
Insert/upsert webhook_events row.
For charge.success events, finalize payment by reference.
Use the same validation as callback: status, amount, currency, order reference.
Call issue_tickets_for_order(order_id) idempotently.
Return JSON response quickly.
Webhook must tolerate duplicates.
Webhook must not create duplicate tickets.
```

Implementation hint:

```text
Use finalizePaystackPayment(reference) if it already performs Paystack verification and idempotent ticket issue.
```

Acceptance checks:

```text
Valid webhook logs webhook event.
Invalid webhook signature returns 401.
Duplicate webhook does not duplicate tickets.
charge.success creates/keeps paid order and issued tickets.
```

---

## 10. Critical Task D — Make Ticket Issuing Fully Idempotent

Review:

```text
supabase/migrations/202606120004_idempotent_ticket_issuing.sql
lib/ticketing.ts
```

Requirements:

```text
The SQL function issue_tickets_for_order must only create missing tickets.
If an order quantity is 5 and 5 tickets already exist, it creates 0.
If an order quantity is 5 and 2 tickets exist, it creates 3.
Function must reject unpaid orders.
Function must reject missing orders.
```

Important improvement:

```text
In finalizePaystackPayment, call issue_tickets_for_order even when order.status is already paid. The SQL function is idempotent, so it can safely create missing tickets if a previous process marked paid but failed before creating tickets.
```

Acceptance checks:

```text
Refreshing callback creates no duplicates.
Webhook after callback creates no duplicates.
Callback after webhook creates no duplicates.
```

---

## 11. Critical Task E — Ticket Page Must Be Real

Review:

```text
app/ticket/[ticketCode]/page.tsx
lib/ticketing.ts
```

Requirements:

```text
Fetch ticket by ticket_code from Supabase.
Show not found if missing.
Display event name.
Display ticket type.
Display holder name.
Display ticket status.
Display event date.
Display KICC Nairobi for physical tickets.
Display Zoom/Online Access for virtual tickets.
Generate QR code to /verify-ticket?code=...
For virtual tickets, show Calendly/Zoom CTA.
For physical tickets, instruct buyer to present QR code at gate.
```

Acceptance checks:

```text
Ticket page cannot render fake unpaid ticket.
Ticket page uses actual ticket row.
Virtual ticket clearly says virtual access.
Physical ticket clearly says gate QR code.
```

---

## 12. Critical Task F — Verification And Check-In

Review:

```text
app/verify-ticket/page.tsx
```

Existing page can look up a ticket, but protected check-in must be completed.

Requirements:

```text
Manual code entry works.
Ticket status displays: valid, checked_in, cancelled, refunded, not found.
Physical tickets can be checked in by authorized gate staff.
Virtual tickets should not be gate-checked unless explicitly required.
A checked_in ticket cannot be accepted again.
Every check-in attempt logs to checkin_logs.
Use protected route/API or Supabase Edge Function for check-in.
```

Existing Supabase Edge Function:

```text
checkin-ticket
```

If using Next.js route instead, keep staff/admin authentication enforced.

Acceptance checks:

```text
Valid physical ticket can be checked in once.
Second check-in attempt is rejected.
Invalid code returns not found.
Virtual ticket does not accidentally pass gate flow as physical.
```

---

## 13. Critical Task G — Virtual Ticket Calendly/Zoom Protection

Review:

```text
app/schedule/page.tsx
lib/scheduling.ts
app/ticket/[ticketCode]/page.tsx
app/payment/callback/page.tsx
```

Current schedule page is open. It should not expose sensitive virtual access before payment.

Minimum safe version:

```text
Show generic scheduling/help options publicly.
On paid virtual ticket pages, show the virtual Calendly URL.
Do not show actual Zoom join links publicly.
```

Better version:

```text
Require ticket code or order reference to access virtual scheduling.
Confirm ticket exists, is paid/valid, and ticket type is virtual.
Then show Calendly virtual event link.
```

Calendly data to store later:

```text
calendly_schedules.invitee_uri
calendly_schedules.event_uri
calendly_schedules.invitee_email
calendly_schedules.invitee_name
calendly_schedules.scheduled_start_time
calendly_schedules.scheduled_end_time
calendly_schedules.zoom_join_url
```

Acceptance checks:

```text
Unpaid users cannot see protected virtual access details.
Paid virtual buyers can open scheduling/access link from ticket page or callback.
Calendly/Zoom instructions are clear for people outside Kenya.
```

---

## 14. Critical Task H — Admin Dashboard

Review:

```text
app/admin/page.tsx
```

Build a simple internal admin screen. Keep it secure.

Minimum useful sections:

```text
Total orders
Paid orders
Pending orders
Failed orders
Revenue
Physical tickets sold
Virtual tickets sold
Recent orders
Recent tickets
Recent check-ins
Export attendees link/action
```

Role separation later:

```text
Admin: everything
Finance: orders, payments, revenue
Gate staff: verify/check-in only
Support: order lookup/resend ticket only
```

Acceptance checks:

```text
Admin can see order totals.
Admin can distinguish physical vs virtual buyers.
Admin can export attendees.
Gate staff cannot see revenue when role protection is added.
```

---

## 15. Critical Task I — Delivery: Email/WhatsApp/SMS Placeholder

The app needs a delivery layer. If provider is not chosen yet, implement clean placeholders and database fields.

Required behavior:

```text
After successful payment, prepare ticket delivery payload.
Ticket delivery should include ticket code, event details, ticket URL, and support contact.
Virtual ticket delivery should include Calendly/Zoom instructions.
Create resend-ticket flow that fetches ticket and returns prepared message.
Do not claim email/WhatsApp/SMS was sent unless provider is actually integrated.
```

Useful later providers:

```text
Email: Resend, SendGrid, Postmark, or Supabase email provider
WhatsApp: Meta WhatsApp Cloud API or approved BSP
SMS: Africa's Talking or Twilio
```

Acceptance checks:

```text
Resend-ticket finds real ticket.
Response clearly says delivery provider is not connected if not connected.
No fake “sent successfully” message without provider integration.
```

---

## 16. Critical Task J — Google Search / SEO / Structured Data

Add Google-friendly event content and metadata.

Requirements:

```text
Add event JSON-LD to the Men’s Conference page.
Include Event schema.
Include physical location: KICC Nairobi.
Include online/virtual access indication.
Include offers for each public ticket type.
Include organizer: Keith Muoki / Kujua Point.
Add canonical URL support.
Add Open Graph metadata.
Add Twitter/X card metadata.
Add robots.txt.
Add sitemap.xml or Next.js metadata route.
```

Recommended content sections on landing page:

```text
About the conference
Who should attend
What men will learn
Physical attendance at KICC
Virtual attendance outside Kenya
Speakers / host section
FAQ
Ticket policy
Support contact
```

Acceptance checks:

```text
Google Rich Results Test can parse Event structured data.
The page has a useful title and description.
Open Graph image uses the poster.
Sitemap includes the event URL.
```

---

## 17. Meta Pixel Rules

The owner will place the Meta Pixel directly.

Do not remove or block manual placement.

If adding hooks or client components, use these event rules:

```text
PageView — global
ViewContent — event page load
InitiateCheckout — after checkout starts
Purchase — only after verified Paystack payment and ticket issue
```

Never fire Purchase when the user only clicks Book Now.

Purchase event parameters should include:

```text
content_name: Men’s Conference 2026
content_type: event_ticket
content_category: physical_ticket OR virtual_ticket
currency: KES
value: final order amount
order_id: Supabase order id
```

---

## 18. UI/UX Requirements

Keep the page simple and conversion-focused.

```text
Mobile-first layout
Clear poster hero
Strong Book Now CTA
Physical and virtual ticket cards
Simple buyer form
Terms checkbox
Marketing opt-in
Paystack reassurance
Calendly/Zoom note for virtual buyers
Support phone visible
```

Make sure the poster exists here:

```text
public/mens-conference-poster.jpg
```

If the file is missing, show a graceful placeholder or tell the developer to add it.

---

## 19. Legal / Trust Pages

Create simple pages if missing:

```text
/app/terms/page.tsx
/app/privacy/page.tsx
/app/refund-policy/page.tsx
/app/contact/page.tsx
```

Minimum content:

```text
Event tickets are issued after payment confirmation.
Tickets may be checked in once.
Virtual access instructions are shared after payment confirmation.
Refund policy must be clear.
Support contact: 0750 886 617.
```

Do not write false legal claims. Keep wording simple and editable.

---

## 20. Testing Commands

Run:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Test pages:

```text
/
/conference/men-conference-2026
/payment/callback?reference=TEST_REFERENCE
/ticket/[ticketCode]
/verify-ticket
/schedule
/admin
```

Test flows:

```text
Physical Early Bird order
Physical 2 Men order
Physical 5 Men order
Virtual Ticket order
Successful Paystack test payment
Failed Paystack payment
Callback refresh
Duplicate webhook
Invalid ticket verification
Valid ticket verification
Physical check-in once
Duplicate physical check-in
Virtual ticket scheduling CTA
```

---

## 21. Code Quality Rules

```text
Do not put service role keys in client components.
Do not put Paystack secret keys in client components.
Do not trust frontend amounts.
Do not issue tickets before payment verification.
Do not mark orders paid without status, amount, and currency validation.
Use server routes or Edge Functions for sensitive work.
Keep functions idempotent.
Keep UI copy simple and sales-focused.
Keep the app one-event only.
```

---

## 22. Acceptance Criteria For This Codex Run

The run is complete only when all of these are true:

```text
A buyer can open the Men’s Conference page.
The buyer can choose Early Bird, 2 Men, 5 Men, or Virtual Ticket.
The buyer can enter name, email, phone, quantity, and submit.
The server creates a Supabase order.
The server creates Supabase order items.
The server initializes Paystack.
The buyer is redirected to Paystack.
The callback verifies Paystack payment.
The order is marked paid only after verified payment.
The system validates amount and currency.
The system generates tickets idempotently.
The buyer can open the issued ticket page.
The QR code points to the verification page.
The verification page reads real Supabase ticket data.
Physical tickets can be checked in once by authorized staff.
Virtual buyers see Calendly/Zoom access instructions after payment.
Duplicate callback or webhook does not duplicate tickets.
Admin can see orders/tickets/revenue basics.
Meta Purchase is not fired before verified payment.
The app builds successfully.
```

---

## 23. Final Developer Note

This project is close to a working MVP. Do not rebuild it from scratch. Continue from the current files and harden the missing pieces.

The priority order is:

```text
1. Finish Paystack + Supabase payment finalization.
2. Finish webhook finalization.
3. Ensure idempotent ticket creation.
4. Finish real ticket page and verification/check-in.
5. Protect virtual Calendly/Zoom access.
6. Add admin basics.
7. Add SEO/Event structured data.
8. Add legal/trust pages.
9. Run build and fix TypeScript issues.
```
