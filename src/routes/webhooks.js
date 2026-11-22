const express = require("express");
const Stripe = require("stripe");
const prisma = require("../db");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: "invalid signature" });
  }

  const intent = event.data.object;

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const status = event.type === "payment_intent.succeeded" ? "succeeded" : "failed";

    await prisma.payment.updateMany({
      where: { providerRef: intent.id },
      data: { status }
    });
  }

  res.json({ received: true });
});

module.exports = router;
