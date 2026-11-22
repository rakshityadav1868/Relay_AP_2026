const express = require("express");
const Stripe = require("stripe");
const Razorpay = require("razorpay");
const prisma = require("../db");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder"
});

router.post("/", async (req, res) => {
  try {
    const { amount, currency, provider } = req.body;

    if (!amount || !provider) {
      return res.status(400).json({ error: "missing required fields" });
    }

    let providerRef = null;

    if (provider === "stripe") {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: (currency || "inr").toLowerCase()
      });
      providerRef = intent.id;
    }

    if (provider === "razorpay") {
      const order = await razorpay.orders.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: currency || "INR"
      });
      providerRef = order.id;
    }

    const payment = await prisma.payment.create({
      data: {
        userId: req.user ? req.user.id : 1,
        amount: parseFloat(amount),
        currency: currency || "INR",
        provider,
        providerRef,
        status: "pending"
      }
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ error: "payment not found" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

module.exports = router;
