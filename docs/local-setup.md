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

## 4. Add Paystack keys

Open `.env.local` and add your Paystack test secret key.

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback
APP_BASE_URL=http://localhost:3000
```

## 5. Add Calendly links

For the first version, Calendly is used through direct event links. Replace these with the real event-type URLs from your Calendly account.

```env
NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL=https://calendly.com/keithmuoki
NEXT_PUBLIC_CALENDLY_GROUP_TICKET_URL=https://calendly.com/keithmuoki
NEXT_PUBLIC_CALENDLY_SUPPORT_URL=https://calendly.com/keithmuoki
```

Connect Zoom inside Calendly so scheduled virtual sessions can automatically receive Zoom links.

```env
ZOOM_MODE=calendly_zoom
```

## 6. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 7. Test flow

1. Open `/conference/men-conference-2026`.
2. Ask the ticketing assistant about Early Bird, Virtual, Zoom, group tickets, or payment.
3. Choose Early Bird Physical Ticket or Virtual Ticket.
4. Fill in the buyer details.
5. Click `Proceed to Paystack`.
6. Complete a Paystack test payment.
7. Paystack redirects to `/payment/callback`.
8. The app verifies the payment.
9. The app shows a QR ticket page.
10. Virtual and group-ticket buyers can open `/schedule` for Calendly/Zoom scheduling.

## Notes

The current version is the first runnable skeleton. Supabase persistence, admin role protection, real order storage, Calendly webhook storage, Zoom join link storage, and one-time ticket check-in are the next build phase.
