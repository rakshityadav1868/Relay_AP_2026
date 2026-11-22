const express = require("express");
const Stripe = require("stripe");
const prisma = require("../db");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

router.post("/", async (req, res) => {
  try {
    const { amount, currency, provider } = req.body;

    if (!amount || !provider) {
      return res.status(400).json({ error: "missing required fields" });
    }

    if (provider === "stripe") {
      await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: (currency || "inr").toLowerCase()
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: req.user ? req.user.id : 1,
        amount: parseFloat(amount),
        currency: currency || "INR",
        provider,
        status: "pending"
      }
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

module.exports = router;
