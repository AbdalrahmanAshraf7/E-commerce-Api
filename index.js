const express = require("express");
const mongoose = require("mongoose");
const userPath = require("./Routes/users");
const auth = require("./Routes/auth");
const products = require("./Routes/products");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MongoUrI)
  .then(() => console.log("Connected to mongooo"))
  .catch((err) => console.log("not working", err));

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Middlewares
app.use(express.json());

// Routes
app.use("/api/", userPath);
app.use("/api/", auth);
app.use("/api", products);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// ❌ متعملش listen هنا (Vercel مش بيحتاجه)
// const Port = process.env.PORT || 5000
// app.listen(Port , ()=>console.log(`server is listening on port : ${Port}`))

// ✅ بدل كده: صدّر الـ app كـ handler
module.exports = app;
