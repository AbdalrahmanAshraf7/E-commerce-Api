const express = require("express")
const app = express()
const mongoose = require("mongoose")
const userPath = require("./Routes/users")
const payMent = require("./Routes/server")
const Stripe = require("./Routes/Stripe")
const cors = require('cors');
const auth = require("./Routes/auth")
const {routers ,sendNoti } = require("./Routes/notifications")
const products = require("./Routes/products")
const notificationsPermisson = require("./Routes/notificationsPermisson")
const dotenv = require("dotenv")
const { required } = require("joi")
dotenv.config()


mongoose.connect(process.env.MongoUrI).then(()=>console.log("Connected to mongooo")).catch((err)=>console.log("not working",err))

app.use(cors());

app.use(express.json());

app.use("/api/",userPath)
app.use("/api/",auth)
app.use("/api",products)
app.use("/api",routers )
app.use("/api",notificationsPermisson)
app.use("/api",payMent)
app.use("/api",Stripe)

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


const Port = process.env.PORT || 5000

app.listen(Port , ()=>console.log(`server is listening on port : ${Port}`))

module.exports = app