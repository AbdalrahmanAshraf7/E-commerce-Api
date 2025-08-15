const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler")
const express = require("express")
const router = express.Router()


function tokenCheck(req, res, next) {
  const authHeader = req.headers.token;
  console.log(authHeader)
  if(!authHeader) return res.status(400).json({message : "token is required"})

    try{
        req.itIsAdmin = jwt.decode(authHeader).isAdmian

    }catch(err){
        res.status(400).json({message : "some thing went wrong , you are not allowed to do this action"})
    }
  next() 
}

module.exports = tokenCheck