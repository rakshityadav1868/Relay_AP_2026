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

    const payment = await prisma.payment.findUnique({
      where: { providerRef: intent.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status }
      });

      await prisma.webhookEvent.create({
        data: {
          paymentId: payment.id,
          eventType: event.type,
          payload: req.body.toString()
        }
      });
    }
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
  const entity = event.payload.payment.entity;

  if (event.event === "payment.captured" || event.event === "payment.failed") {
    const status = event.event === "payment.captured" ? "succeeded" : "failed";

    const payment = await prisma.payment.findUnique({
      where: { providerRef: entity.order_id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status }
      });

      await prisma.webhookEvent.create({
        data: {
          paymentId: payment.id,
          eventType: event.event,
          payload: req.body.toString()
        }
      });
    }
  }

  res.json({ received: true });
});

router.get("/payment/:paymentId", async (req, res) => {
  const paymentId = parseInt(req.params.paymentId);

  if (isNaN(paymentId)) {
    return res.status(400).json({ error: "invalid payment id" });
  }

  const events = await prisma.webhookEvent.findMany({
    where: { paymentId },
    orderBy: { receivedAt: "desc" }
  });

  res.json(events);
});

module.exports = router;
