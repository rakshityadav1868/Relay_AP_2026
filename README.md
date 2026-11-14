# Relay

Relay is a small payment API. A user signs up, creates an API key, and uses that key to create payments. When a payment provider like Stripe or Razorpay sends back an update, Relay saves it as a webhook event against that payment.

It is a smaller, simpler version of Kairo, a payment orchestration project I built earlier. This one keeps only the basic parts so the database is easy to follow.

## What it does

- Sign up and log in
- Create and delete API keys
- Create a payment and check its status
- Save webhook events that come in for a payment

## Tech

- Node.js and Express for the API
- PostgreSQL for the database
- Prisma to talk to the database

## Database

There are four tables.

| Table | What it stores |
|---|---|
| users | People who sign up |
| api_keys | Keys a user makes to call the API |
| payments | Every payment created through the API |
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

Open `.env` and set `DATABASE_URL` to your local PostgreSQL database and `PORT` to any free port.

Then:

```
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Team

Rakshit Yadav, Archit Jain, Gourav Jain, Ishaan Goel
