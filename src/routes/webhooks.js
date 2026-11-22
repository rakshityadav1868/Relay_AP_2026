const express = require("express");
const crypto = require("crypto");
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

router.post("/razorpay", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(req.body)
    .digest("hex");

  if (signature !== expected) {
    return res.status(400).json({ error: "invalid signature" });
  }

  const event = JSON.parse(req.body);
  const payment = event.payload.payment.entity;

  if (event.event === "payment.captured" || event.event === "payment.failed") {
    const status = event.event === "payment.captured" ? "succeeded" : "failed";

    await prisma.payment.updateMany({
      where: { providerRef: payment.order_id },
      data: { status }
    });
  }

  res.json({ received: true });
});

module.exports = router;
