const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        stripeSecretKey: true,
        razorpayKeyId: true,
        razorpayKeySecret: true
      }
    });

    res.json({
      stripeSecretKey: user.stripeSecretKey ? "••••••••" : null,
      razorpayKeyId: user.razorpayKeyId || null,
      razorpayKeySecret: user.razorpayKeySecret ? "••••••••" : null
    });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const { stripeSecretKey, razorpayKeyId, razorpayKeySecret } = req.body || {};

    const data = {};
    if (stripeSecretKey) data.stripeSecretKey = stripeSecretKey;
    if (razorpayKeyId) data.razorpayKeyId = razorpayKeyId;
    if (razorpayKeySecret) data.razorpayKeySecret = razorpayKeySecret;

    await prisma.user.update({
      where: { id: req.user.id },
      data
    });

    res.json({ message: "provider keys saved" });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

module.exports = router;
