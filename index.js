const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userPath = require("./Routes/users");
const auth = require("./Routes/auth");
const products = require("./Routes/products");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MongoUrI)
  .then(() => console.log("Connected to mongooo"))
  .catch((err) => console.log("not working", err));

// ✅ السماح بأكتر من Origin (localhost + Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.vercel.app" // غيرها بدومين الفرونت إند بعد النشر
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use("/api", userPath);
app.use("/api", auth);
app.use("/api", products);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

const Port = process.env.PORT || 5000;
app.listen(Port, () => console.log(`server is listening on port : ${Port}`));

module.exports = app;
