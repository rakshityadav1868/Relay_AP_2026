require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const apiKeyRoutes = require("./routes/apiKeys");
const paymentRoutes = require("./routes/payments");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api-keys", apiKeyRoutes);
app.use("/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Relay API");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
