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
    let checkoutUrl = null;
    let razorpayKeyId = null;

    if (provider === "stripe") {
      const stripe = new Stripe(req.user.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: (currency || "inr").toLowerCase(),
              product_data: { name: "Relay Payment" },
              unit_amount: Math.round(parseFloat(amount) * 100)
            },
            quantity: 1
          }
        ],
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/?paid=1`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/?cancelled=1`
      });
      providerRef = session.id;
      checkoutUrl = session.url;
    }

    if (provider === "razorpay") {
      razorpayKeyId = req.user.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: req.user.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "placeholder"
      });
      const order = await razorpay.orders.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: currency || "INR",
        payment_capture: 1
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

    res.status(201).json({ ...payment, checkoutUrl, razorpayKeyId });
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
