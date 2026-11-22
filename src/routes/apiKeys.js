const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body || {};

    const plainKey = "rk_" + crypto.randomBytes(24).toString("hex");
    const keyHash = await bcrypt.hash(plainKey, 10);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: req.user.id,
        keyHash,
        name: name || null
      }
    });

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      key: plainKey
    });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });

    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

module.exports = router;
