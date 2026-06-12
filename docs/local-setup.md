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

## 5. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 6. Test flow

1. Open `/conference/men-conference-2026`.
2. Fill in the buyer details.
3. Click `Proceed to Paystack`.
4. Complete a Paystack test payment.
5. Paystack redirects to `/payment/callback`.
6. The app verifies the payment.
7. The app shows a QR ticket page.

## Notes

The current version is the first runnable skeleton. Supabase persistence, admin role protection, real order storage, and one-time ticket check-in are the next build phase.
