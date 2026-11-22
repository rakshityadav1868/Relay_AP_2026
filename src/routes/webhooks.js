const express = require("express");

const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const event = JSON.parse(req.body);

  res.json({ received: true });
});

module.exports = router;
