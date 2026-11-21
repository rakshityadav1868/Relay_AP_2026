const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "missing required fields" });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: "email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
});

module.exports = router;
