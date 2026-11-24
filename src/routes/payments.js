const express = require("express");
const Stripe = require("stripe");
const Razorpay = require("razorpay");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { amount, currency, country } = req.body;
    let provider = req.body.provider;

    if (!amount) {
      return res.status(400).json({ error: "missing required fields" });
    }

    if (!provider) {
      const isIndia = country === "IN" || (currency || "").toUpperCase() === "INR";
      provider = isIndia ? "razorpay" : "stripe";
    }

    let providerRef = null;

    if (provider === "stripe") {
      const stripe = new Stripe(req.user.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: (currency || "inr").toLowerCase()
      });
      providerRef = intent.id;
    }

    if (provider === "razorpay") {
      const razorpay = new Razorpay({
        key_id: req.user.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        key_secret: req.user.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "placeholder"
      });
      const order = await razorpay.orders.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: currency || "INR"
      });
      providerRef = order.id;
    }

    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        currency: currency || "INR",
        provider,
        providerRef,
        status: "pending"
      }
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error("POST /payments failed:", err.message || err);
    res.status(500).json({ error: "something went wrong" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    res.json(payments);
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
