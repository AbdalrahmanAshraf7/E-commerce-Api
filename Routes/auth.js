const express = require("express")
const router = express.Router()
const {User , registerValidation, signUpValidation} = require("../modules/User")
const asyncHandler = require("express-async-handler")
const bycript = require("bcryptjs")
const jwt = require("jsonwebtoken")



router.post("/user/register",asyncHandler(
    async (req,res)=>{
      let {error} = registerValidation(req.body)
      if(error){
        return res.json({message : error.details[0].message})
      }

      let user = await User.findOne({userEmail : req.body.userEmail})

      if(user){
       return  res.status(200).json({message : " this email is  already used"})
      }

      const salt = await bycript.genSalt(10)
      req.body.password = await bycript.hash(req.body.password , salt)

         user = new User ({
          userName : req.body.userName ,
          userEmail : req.body.userEmail ,
          password : req.body.password ,
        })

        let token = jwt.sign({id : user._id , userName : user.userName , email : user.userEmail},"secretKey",{ expiresIn: "7d" }) 

        let results = await user.save()

        let {password , ...other} = results._doc
        res.status(200).json({...other , token})
    }
))



router.post("/admin/register",asyncHandler(
    async (req,res)=>{
      let {error} = registerValidation(req.body)
      if(error){
        return res.status(400).json({message : error.details[0].message})
      }

      let user = await User.findOne({userEmail : req.body.userEmail})

      if(user){
       return  res.status(400).json({message : " this email is  already used"})
      }

      const salt = await bycript.genSalt(10)
      req.body.password = await bycript.hash(req.body.password , salt)

         user = new User ({
          userName : req.body.userName ,
          userEmail : req.body.userEmail ,
          password : req.body.password ,
          isAdmian : true ,
        })

        let token = jwt.sign({id : user._id , userName : user.userName , email : user.userEmail},"secretKey",{ expiresIn: "7d" }) 

        let results = await user.save()

        let {password , ...other} = results._doc
        res.status(200).json({...other , token , message : "Success"})
    }
))



router.post("/signin",asyncHandler(
  async(req,res)=>{

    let {error} = signUpValidation(req.body)
    if(error){
        return res.json({message : error.details[0].message})
    }
    let user = await User.findOne({userEmail : req.body.userEmail})

    if(!user){
      return res.status(200).json("Invalid Email Or Password")
    }

    let isPassword = await bycript.compare(req.body.password ,  user.password)

    if(!isPassword){
      return res.status(200).json("Invalid Email Or Password")
    }

    
    
    let token = jwt.sign({id : user._id , userName : user.userName , email : user.userEmail , isAdmian : user.isAdmian},"secretKey",{ expiresIn: "7d" }) 
    let {password , ...other} = user._doc
    res.status(200).json({ ...other,token})
  }
))

module.exports = router
