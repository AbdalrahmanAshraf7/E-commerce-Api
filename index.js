const express = require("express")
const app = express()
const mongoose = require("mongoose")
const userPath = require("./Routes/users")
const auth = require("./Routes/auth")
const products = require("./Routes/products")
const dotenv = require("dotenv")
dotenv.config()


mongoose.connect(process.env.MongoUrI).then(()=>console.log("Connected to mongooo")).catch((err)=>console.log("not working",err))


app.use(express.json());

app.use("/api/",userPath)
app.use("/api/",auth)
app.use("/api",products)



const Port = process.env.PORT

app.listen(Port , ()=>console.log(`server is listening on port : ${Port}`))