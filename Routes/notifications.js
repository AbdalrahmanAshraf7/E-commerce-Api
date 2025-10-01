const express = require("express");
const admin = require("./fireBase"); // استدعاء التهيئة
const app = express();
const router = express.Router()
const asyncHandler = require("express-async-handler");



app.use(express.json());

async function sendIt (TK  , text){
  const message = {
    token : TK , 
    notification :{
      title : " from my app" , 
      body : text
    }
  }

  try{
   let res = await admin.messaging().send(message)
   console.log("good" , res)

  }catch(err){

    console.log(err)

  }



}

// جرّب بالـ Token بتاعك
// sendNotification("c4Aeh0I8nfWy7FRi4PYdfU:APA91bGIHXyCoAjb_6iPwwLNTkbQgGdT0akmV5bRbN52SgeekSdx2dKqvPbYKCUGGDEbSkjQMoQnhsjAXEVRGkAQ-DO-1ktAzx5yaS97pLWIryFlOmtwmAY");
router.post(
  "/notifications",
  asyncHandler(async (req, res) => {
   sendIt(req.body.token , " this is a message " )
   console.log(req.body)
  })
);


module.exports = {
  routers : router , 
  sendNoti :  sendIt

}
