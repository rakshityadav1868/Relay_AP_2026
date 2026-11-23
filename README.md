# Relay

## Problem statement

Businesses that want to accept online payments usually have to integrate
directly with a payment provider like Stripe or Razorpay. Each provider has
its own SDK, its own webhook format, its own signature verification, and its
own dashboard. Supporting a second provider (for example adding Razorpay for
UPI payments in India, alongside Stripe for international cards) means
building and maintaining a second, separate integration from scratch.

Relay is a unified payment layer: a business integrates **once** against
Relay's API, connects its own Stripe and/or Razorpay accounts, and Relay
takes care of routing the payment to the right provider and normalizing
webhooks from both of them into one consistent format. It is a smaller,
simpler version of Kairo, a payment orchestration project built earlier.

## What it does

- Sign up and log in
- Create and delete API keys
- Connect your own Stripe secret key and/or Razorpay key id/secret
  (bring-your-own-key — Relay never holds the business's money, it only
  calls the provider using that business's own credentials)
- Create a payment, either against an explicit provider (`stripe` or
  `razorpay`) or let Relay auto-route it: if the request's `country` is
  `IN` or `currency` is `INR`, it goes to Razorpay (for UPI/local methods),
  otherwise it goes to Stripe
- Verify incoming Stripe/Razorpay webhook signatures, update the matching
  payment's status (succeeded/failed), and save a `webhook_events` row
- View a payment's webhook event history (id, event type, received at)

## How a payment flows end to end

1. Business signs up, gets a Relay API key, and saves its own Stripe/Razorpay
   keys through `PUT /provider-keys`.
2. Business calls `POST /payments` with an amount and currency (and
   optionally a country, or an explicit provider). Relay picks a provider,
   creates a real payment intent/order with that business's own provider
   keys, and stores the provider's reference id against the payment.
3. The customer pays through Stripe/Razorpay's own checkout.
4. Stripe/Razorpay sends a webhook to `POST /webhooks/stripe` or
   `POST /webhooks/razorpay`. Relay verifies the signature, finds the
   matching payment by its provider reference id, updates its status, and
   logs a `webhook_events` row.
5. Business checks payment status or webhook history through Relay's API
   or the included dashboard page.

## Tech

- Node.js and Express for the API
- PostgreSQL for the database
- Prisma to talk to the database
- Plain React (Vite) for the dashboard

## Database

| Table | What it stores |
|---|---|
| users | People who sign up, plus their own Stripe/Razorpay keys |
| api_keys | Keys a user makes to call the API |
| payments | Every payment created through the API, with the provider's reference id |
| webhook_events | Updates received for a payment |

How they connect:

- one user has many api keys
- one user has many payments
- one payment has many webhook events

The database files for the DBMS course are in the `dbms/` folder.

## Setup

You need Node.js and PostgreSQL installed.

```
npm install
cp .env.example .env
```

Open `.env` and fill in:

- `DATABASE_URL` — your local PostgreSQL connection string
- `PORT` — any free port
- `JWT_SECRET` — any string, used to sign login tokens
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from
  [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
  (Test mode). Used as the fallback provider if a signed-up user hasn't
  connected their own Stripe key yet.
- `STRIPE_WEBHOOK_SECRET` — create an endpoint at
  [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
  pointing at `https://<your-ngrok-url>/webhooks/stripe`, listening for
  `payment_intent.succeeded` and `payment_intent.payment_failed`, then copy
  its signing secret
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from
  [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys),
  make sure you're in **Test Mode** before generating these
- `RAZORPAY_WEBHOOK_SECRET` — create a webhook at
  [dashboard.razorpay.com/app/webhooks](https://dashboard.razorpay.com/app/webhooks)
  (also in **Test Mode**) pointing at `https://<your-ngrok-url>/webhooks/razorpay`,
  listening for `payment.captured` and `payment.failed`, using a secret you
  choose yourself — put that same secret here

Since Stripe/Razorpay need a public URL to send webhooks to, expose your
local server with ngrok (`ngrok http 3000`) and use the printed URL above.
The URL changes every time ngrok restarts (free plan), so the webhook
endpoints need to be re-pointed if that happens.

Then:

```
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

And for the frontend:

```
cd frontend
npm install
npm run dev
```

## Team

Rakshit Yadav, Archit Jain, Gourav Jain, Ishaan Goel
