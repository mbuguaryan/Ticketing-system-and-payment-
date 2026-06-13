# Local Setup

## 1. Clone

```bash
git clone https://github.com/mbuguaryan/Ticketing-system-and-payment-.git
cd Ticketing-system-and-payment-
```

## 2. Install packages

```bash
npm install
```

## 3. Create environment file

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## 4. Add Supabase keys

The app is wired to the AI CHATBOT Supabase project.

```env
NEXT_PUBLIC_SUPABASE_URL=https://tgxpamjfjieesoayxtrk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Keep the service role key server-side only.

## 5. Add Paystack keys

Open `.env.local` and add your Paystack test keys.

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback
APP_BASE_URL=http://localhost:3000
```

## 6. Add the poster

Place the current Men’s Conference poster here:

```text
public/mens-conference-poster.jpg
```

## 7. Add Calendly links

For the first version, Calendly is used through direct event links. Replace these with the real event-type URLs from your Calendly account.

```env
NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL=https://calendly.com/keithmuoki/your-virtual-event
NEXT_PUBLIC_CALENDLY_GROUP_TICKET_URL=https://calendly.com/keithmuoki/your-group-call
NEXT_PUBLIC_CALENDLY_SUPPORT_URL=https://calendly.com/keithmuoki/your-support-call
ZOOM_MODE=calendly_zoom
```

Connect Zoom inside Calendly so scheduled virtual sessions can automatically receive Zoom links.

## 8. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 9. Test flow

1. Open `/conference/men-conference-2026`.
2. Choose Early Bird, 2 Men, 5 Men, or Virtual Ticket.
3. Fill in the buyer details.
4. Click `Book Now`.
5. The app creates an order in Supabase.
6. The app initializes Paystack.
7. Complete a Paystack test payment.
8. Paystack redirects to `/payment/callback`.
9. The app verifies the transaction, marks the order paid, and issues tickets.
10. Open the ticket page.
11. Test `/verify-ticket?code=YOUR_TICKET_CODE`.
12. Virtual buyers can open `/schedule` after confirmation for Calendly/Zoom access.

## Notes

The frontend now uses an order-first Supabase flow before Paystack checkout. The webhook route still needs final hardening if you want all payment finalization to happen through provider notifications as well as the callback page.
