const express = require("express");
const prisma = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { amount, currency, provider } = req.body;

    if (!amount || !provider) {
      return res.status(400).json({ error: "missing required fields" });
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
