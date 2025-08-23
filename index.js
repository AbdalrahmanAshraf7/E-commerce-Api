const express = require("express")
const app = express()
const mongoose = require("mongoose")
const userPath = require("./Routes/users")
const auth = require("./Routes/auth")
const products = require("./Routes/products")
const dotenv = require("dotenv")
const cors = require("cors")   // 👈 استدعاء cors
dotenv.config()


mongoose.connect(process.env.MongoUrI).then(()=>console.log("Connected to mongooo")).catch((err)=>console.log("not working",err))

app.use(cors({
  origin: "http://localhost:5173"  ,
    credentials: true
}))


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); 
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json());

app.use("/api/",userPath)
app.use("/api/",auth)
app.use("/api",products)

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

app.options("*", cors());




const Port = process.env.PORT || 5000

app.listen(Port , ()=>console.log(`server is listening on port : ${Port}`))


module.exports = app;
