const express = require("express")
const app = express()
const mongoose = require("mongoose")
const userPath = require("./Routes/users")
const auth = require("./Routes/auth")
const products = require("./Routes/products")
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config()


mongoose.connect(process.env.MongoUrI).then(()=>console.log("Connected to mongooo")).catch((err)=>console.log("not working",err))
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/",userPath)
app.use("/api/",auth)
app.use("/api",products)

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// لو حصل Error في أي Route
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});



const Port = process.env.PORT || 5000

app.listen(Port , ()=>console.log(`server is listening on port : ${Port}`))

app.options("*", cors());