const express = require("express")
const router = express.Router()
const asyncHandler = require("express-async-handler");
const {User} = require("../modules/User")
const tokenCartCheck = require("../middlewares/cartTokenMiddleWare")


router.post("/notificationspermisson" , tokenCartCheck , asyncHandler(
    async(req ,res )=>{
        let user = await User.findById(req.userId)

       user.notificationsPermisson = req.body.token

       console.log(user)

       await user.save()

       

       res.json({message : "sucess",
        data : user.notificationsPermisson
       })

    }
))











module.exports = router