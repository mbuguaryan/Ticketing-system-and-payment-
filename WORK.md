# WORK.md — Codex Build Instructions

## System Role

You are Codex working inside the repository:

```text
mbuguaryan/Ticketing-system-and-payment-
```

Build a complete **PesaLink + Supabase ticketing system** for the **2026 Men Conference Nairobi**, hosted by **Keith Muoki / Kujua Point**.

Act as a senior full-stack engineer and product builder. Prioritize working implementation, secure payment flow, clean admin operations, and simple user experience.

Do not leave fake features. If a provider API is not available yet, build a clean adapter and manual fallback.

---

## Product Definition

The platform sells tickets for the 2026 Men Conference Nairobi.

The system must:

1. Create ticket orders.
2. Show PesaLink payment instructions.
3. Allow manual payment confirmation by admin/finance.
4. Support future automated PesaLink provider confirmation.
5. Generate QR tickets only after payment is confirmed.
6. Verify QR tickets at the gate.
7. Prevent duplicate check-ins.
8. Give admins clear order, payment, ticket, and check-in visibility.

---

## Tech Stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions
- Vercel deployment
- QR code generation
- PesaLink payment-provider abstraction

Recommended packages:

```bash
npm install @supabase/supabase-js qrcode lucide-react zod date-fns
npm install -D supabase
```

---

## Brand / UX Direction

Design should match a premium men’s leadership conference:

- Dark masculine interface
- Deep navy / charcoal / black
- Bronze or gold accents
- Strong typography
- Mobile-first checkout
- Mobile-first gate scanner
- Simple admin operations
- No clutter
- High trust
- Fast purchase flow

---

## Ticket Types

Seed these ticket types:

1. Early Bird
   - Price: KES 1,000
   - Public
   - Limited offer

2. Regular
   - Price: KES 1,500
   - Public

3. VIP
   - Price: KES 3,000
   - Public
   - Highlighted

4. Group Ticket
   - Custom price
   - Request support
   - Not directly purchasable unless enabled by admin

5. Sponsor Pass
   - Price: 0
   - Manual creation only

---

## Required Routes

### Public Routes

```text
/conference/men-conference-2026
/checkout
/payment/[orderId]
/ticket/[ticketCode]
/verify-ticket
```

### Admin Routes

```text
/admin
/admin/orders
/admin/tickets
/admin/payments
/admin/manual-confirmation
/admin/checkin
/admin/reports
```

---

## Required Supabase Tables

Create migrations for:

- `profiles`
- `events`
- `ticket_types`
- `orders`
- `order_items`
- `payment_intents`
- `payment_logs`
- `tickets`
- `checkins`
- `audit_logs`

Use UUID primary keys, timestamps, and appropriate foreign keys.

---

## Database Schema Requirements

### profiles

Fields:

- `id uuid primary key references auth.users(id)`
- `full_name text`
- `role text`
- `created_at timestamptz`

Allowed roles:

```text
super_admin
event_admin
finance
gate_staff
viewer
```

### events

Fields:

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text unique not null`
- `description text`
- `venue text`
- `city text default 'Nairobi'`
- `country text default 'Kenya'`
- `event_date date`
- `start_time time`
- `end_time time`
- `status text default 'draft'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Allowed statuses:

```text
draft
published
closed
cancelled
```

### ticket_types

Fields:

- `id uuid primary key default gen_random_uuid()`
- `event_id uuid references events(id) on delete cascade`
- `name text not null`
- `description text`
- `price numeric not null default 0`
- `currency text default 'KES'`
- `quantity_limit integer`
- `tickets_sold integer default 0`
- `is_active boolean default true`
- `is_public boolean default true`
- `sort_order integer default 0`
- `created_at timestamptz default now()`

### orders

Fields:

- `id uuid primary key default gen_random_uuid()`
- `event_id uuid references events(id) on delete cascade`
- `buyer_name text not null`
- `buyer_phone text not null`
- `buyer_email text`
- `quantity integer not null default 1`
- `subtotal numeric not null default 0`
- `service_fee numeric not null default 0`
- `total_amount numeric not null default 0`
- `currency text default 'KES'`
- `status text default 'pending'`
- `payment_method text default 'pesalink'`
- `payment_provider text`
- `provider_reference text`
- `internal_reference text unique not null`
- `admin_notes text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Allowed order statuses:

```text
pending
awaiting_payment
paid
failed
cancelled
refunded
expired
```

### order_items

Fields:

- `id uuid primary key default gen_random_uuid()`
- `order_id uuid references orders(id) on delete cascade`
- `ticket_type_id uuid references ticket_types(id)`
- `quantity integer not null default 1`
- `unit_price numeric not null`
- `total_price numeric not null`
- `created_at timestamptz default now()`

### payment_intents

Fields:

- `id uuid primary key default gen_random_uuid()`
- `order_id uuid references orders(id) on delete cascade`
- `provider text default 'pesalink'`
- `provider_reference text`
- `checkout_url text`
- `payment_instructions jsonb`
- `amount numeric not null`
- `currency text default 'KES'`
- `status text default 'pending'`
- `expires_at timestamptz`
- `raw_request jsonb`
- `raw_response jsonb`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Allowed payment intent statuses:

```text
pending
processing
paid
failed
expired
cancelled
```

### payment_logs

Fields:

- `id uuid primary key default gen_random_uuid()`
- `order_id uuid references orders(id) on delete set null`
- `payment_intent_id uuid references payment_intents(id) on delete set null`
- `provider text not null`
- `event_type text`
- `provider_reference text`
- `amount numeric`
- `currency text default 'KES'`
- `status text`
- `raw_payload jsonb`
- `created_at timestamptz default now()`

### tickets

Fields:

- `id uuid primary key default gen_random_uuid()`
- `event_id uuid references events(id) on delete cascade`
- `order_id uuid references orders(id) on delete set null`
- `ticket_type_id uuid references ticket_types(id)`
- `ticket_code text unique not null`
- `secure_token_hash text not null`
- `attendee_name text not null`
- `attendee_phone text not null`
- `attendee_email text`
- `qr_code_url text`
- `status text default 'active'`
- `checked_in boolean default false`
- `checked_in_at timestamptz`
- `checked_in_by uuid`
- `created_by uuid`
- `created_at timestamptz default now()`

Allowed ticket statuses:

```text
active
used
cancelled
refunded
```

### checkins

Fields:

- `id uuid primary key default gen_random_uuid()`
- `event_id uuid references events(id) on delete cascade`
- `ticket_id uuid references tickets(id) on delete cascade`
- `checked_in_by uuid`
- `checkin_method text default 'qr_scan'`
- `device_label text`
- `location_label text`
- `created_at timestamptz default now()`

### audit_logs

Fields:

- `id uuid primary key default gen_random_uuid()`
- `actor_id uuid`
- `action text not null`
- `entity_type text not null`
- `entity_id uuid`
- `metadata jsonb`
- `created_at timestamptz default now()`

---

## Required Supabase Edge Functions

Build these functions:

```text
create-ticket-order
initialize-pesalink-payment
pesalink-webhook
confirm-manual-payment
generate-order-tickets
verify-ticket
checkin-ticket
resend-ticket
create-manual-ticket
export-attendees
```

Each function must validate input using `zod` or equivalent validation.

---

## Function Details

### create-ticket-order

Purpose:
Create a pending ticket order.

Input:

- `event_slug`
- `buyer_name`
- `buyer_phone`
- `buyer_email`
- `ticket_type_id`
- `quantity`

Logic:

1. Validate event exists and status is `published`.
2. Validate ticket type is active and public.
3. Validate quantity is greater than zero.
4. Check quantity limit if set.
5. Calculate subtotal and total.
6. Generate internal reference.

Reference format:

```text
KTM-NBI-2026-{random 6 digits}
```

7. Insert order with status `pending`.
8. Insert order item.
9. Return order id, internal reference, and total amount.

---

### initialize-pesalink-payment

Purpose:
Create payment instructions or initialize provider payment.

Input:

- `order_id`
- `provider`

Supported providers:

```text
manual_pesalink
paystack_pesalink
bank_api_pesalink
pesawise_pesalink
```

Logic:

1. Fetch order.
2. Confirm order status is `pending` or `awaiting_payment`.
3. Create payment intent.
4. If provider is `manual_pesalink`, return payment instructions.
5. If provider is another provider, use adapter placeholder.
6. Update order status to `awaiting_payment`.
7. Return payment intent and instructions.

Manual payment instructions must include:

- Bank name
- Account name
- Account number
- Amount
- Internal reference
- Support phone

---

### pesalink-webhook

Purpose:
Receive automated payment confirmation from provider.

Logic:

1. Accept webhook payload.
2. Verify provider signature if available.
3. Store raw payload in `payment_logs`.
4. Extract provider reference, internal reference, amount, and status.
5. Match order by provider reference or internal reference.
6. If payment succeeds and amount matches:
   - Mark payment intent as paid.
   - Mark order as paid.
   - Generate tickets.
7. If payment fails, update payment status.
8. Return success response.

---

### confirm-manual-payment

Purpose:
Allow admin/finance to manually confirm PesaLink payment.

Auth:
Only:

- `super_admin`
- `event_admin`
- `finance`

Input:

- `order_id`
- `paid_amount`
- `bank_reference`
- `notes`

Logic:

1. Validate user role.
2. Fetch order.
3. Confirm paid amount is greater than or equal to order total.
4. Update order to `paid`.
5. Update or create payment intent as `paid`.
6. Insert `payment_logs` row.
7. Generate tickets.
8. Insert `audit_logs` row.
9. Return generated tickets.

---

### generate-order-tickets

Purpose:
Generate tickets only after confirmed payment.

Logic:

1. Fetch paid order and order items.
2. Check if tickets already exist for order.
3. If tickets already exist, return existing tickets.
4. For each ticket quantity:
   - Generate unique ticket code.
   - Generate secure random token.
   - Hash token.
   - Store token hash in `secure_token_hash`.
   - Create QR verification URL.
   - Generate QR image.
   - Upload QR image to Supabase Storage bucket `ticket-qrcodes`.
   - Insert ticket row.
5. Increment `ticket_types.tickets_sold`.
6. Return generated tickets.

Ticket code format:

```text
KTM-NBI-2026-000001
```

QR URL format:

```text
/verify-ticket?code={ticket_code}&token={raw_token}
```

---

### verify-ticket

Purpose:
Verify scanned ticket.

Input:

- `ticket_code`
- `token`

Logic:

1. Fetch ticket by code.
2. Hash submitted token and compare with stored hash.
3. Validate linked order is paid if order exists.
4. Return ticket validity, attendee name, ticket type, checked-in status, and warning if already used.

---

### checkin-ticket

Purpose:
Mark valid ticket as checked in.

Auth:
Only:

- `gate_staff`
- `event_admin`
- `super_admin`

Input:

- `ticket_code`
- `token`
- `device_label`
- `location_label`

Logic:

1. Validate user role.
2. Verify ticket code and token.
3. Reject inactive tickets.
4. Reject already checked-in tickets.
5. Reject unpaid linked orders.
6. Update ticket:
   - `checked_in = true`
   - `checked_in_at = now()`
   - `checked_in_by = auth user`
   - `status = used`
7. Insert `checkins` row.
8. Insert `audit_logs` row.
9. Return success.

---

## Payment Provider Adapter Structure

Create:

```text
src/lib/payments/payment-provider.ts
src/lib/payments/providers/manual-pesalink.ts
src/lib/payments/providers/paystack-pesalink.ts
src/lib/payments/providers/bank-api-pesalink.ts
src/lib/payments/providers/pesawise-pesalink.ts
```

Each adapter should expose:

```ts
createPaymentIntent(order)
verifyWebhook(payload, headers)
normalizeWebhook(payload)
getPaymentStatus(reference)
```

Manual provider should work immediately.
Other providers can be safe placeholders with clear TODOs and typed errors.

---

## Frontend Requirements

### Conference Page

Route:

```text
/conference/men-conference-2026
```

Include:

- Hero section
- Event details
- Keith Muoki speaker section
- Ticket pricing cards
- How ticketing works
- PesaLink trust section
- FAQ
- Buy ticket CTAs

---

### Checkout Page

Route:

```text
/checkout
```

Requirements:

1. Select ticket type.
2. Enter buyer name.
3. Enter phone number.
4. Enter email address.
5. Select quantity.
6. Submit to `create-ticket-order`.
7. Call `initialize-pesalink-payment`.
8. Redirect to payment page.

---

### Payment Page

Route:

```text
/payment/[orderId]
```

Show:

- Amount
- Bank name
- Account name
- Account number
- Internal payment reference
- Support phone
- Status: awaiting payment
- Button: `I Have Paid`
- Button: `Contact Support`

Poll order status every 5 seconds for up to 5 minutes.

If paid, redirect to ticket page.

---

### Ticket Page

Route:

```text
/ticket/[ticketCode]
```

Show:

- Event name
- Attendee name
- Ticket type
- Ticket code
- QR code
- Payment confirmed badge
- Entry instructions

---

### Admin Dashboard

Route:

```text
/admin
```

Cards:

- Total revenue
- Tickets sold
- Paid orders
- Pending orders
- Failed payments
- Checked-in attendees
- VIP sold
- Regular sold
- Early Bird sold

---

### Orders Page

Route:

```text
/admin/orders
```

Features:

- Table of orders
- Search by name, phone, email, reference
- Filter by status
- Open order detail

---

### Manual Confirmation Page

Route:

```text
/admin/manual-confirmation
```

Features:

- List awaiting payment orders
- Search by internal reference
- Enter bank reference
- Enter paid amount
- Add notes
- Confirm payment button
- Generate tickets after confirmation

---

### Gate Check-in Page

Route:

```text
/admin/checkin
```

Requirements:

- Mobile-first
- Phone camera QR scanner
- Manual ticket code input fallback
- Clear result states:
  - Valid
  - Already used
  - Invalid
  - Unpaid

Valid ticket panel:

- Attendee name
- Ticket type
- Payment status
- Button: Check In

Already used panel:

- Warning
- Checked-in time
- Checked-in by

---

## RLS and Security

Implement RLS.

Rules:

- Public can read published event and active public ticket types.
- Public can create orders.
- Public cannot list all orders.
- Admins can read all orders and tickets.
- Finance can read payments but cannot check in tickets.
- Gate staff can verify and check in tickets only.
- Gate staff cannot view revenue.
- Tickets are generated only server-side.
- QR raw token is never stored, only hash is stored.
- Manual confirmations are audit logged.
- Webhook payloads are stored in payment logs.

---

## Environment Variables

Create `.env.example` with:

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

---

## Build Order

Build in this order:

1. Project setup check
2. `.env.example`
3. Supabase migrations
4. Seed event and ticket types
5. Supabase client helpers
6. Payment provider types
7. Manual PesaLink provider
8. Order creation function
9. Payment initialization function
10. Manual payment confirmation function
11. QR ticket generation
12. Ticket verification
13. Ticket check-in
14. Public conference page
15. Checkout page
16. Payment waiting page
17. Ticket display page
18. Admin dashboard
19. Orders page
20. Manual confirmation page
21. Gate scanner page
22. Reports/export page
23. RLS policies
24. Final smoke test

---

## Acceptance Tests

The build is acceptable when:

1. A user can create one Regular ticket order.
2. The system creates a pending order.
3. The system shows PesaLink payment instructions.
4. Admin can confirm payment manually.
5. Tickets are generated after confirmation.
6. QR code opens verification page.
7. Gate staff can scan QR.
8. First scan allows check-in.
9. Second scan shows already used.
10. Admin can export paid attendees.
11. Finance can see payments but cannot check in tickets.
12. Gate staff can check in tickets but cannot see revenue.
13. Tickets are never generated for unpaid orders.
14. Duplicate ticket generation is prevented.
15. Payment logs store all webhook/manual confirmation records.

---

## Implementation Rules

- Keep code typed and clean.
- Do not hardcode secrets.
- Do not expose service role key to the client.
- Use server actions, API routes, or Edge Functions safely.
- Prefer Supabase Edge Functions for privileged actions.
- Use reusable components for cards, tables, badges, buttons, and forms.
- Make error states clear.
- Keep admin UI practical, not decorative.
- Keep buyer checkout simple.
- Keep check-in scanner fast and mobile-first.
- Commit changes in logical chunks.

---

## First Task for Codex

Start by inspecting the repository.

Then create the foundational project structure and files:

```text
.env.example
supabase/migrations/0001_ticketing_schema.sql
supabase/migrations/0002_seed_men_conference.sql
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/payments/payment-provider.ts
src/lib/payments/providers/manual-pesalink.ts
src/lib/tickets/ticket-codes.ts
src/lib/tickets/qr.ts
```

After that, build the first working flow:

```text
Create order -> Show manual PesaLink instructions -> Admin confirms payment -> Generate QR ticket
```
