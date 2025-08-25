const mongoose = require("mongoose")
const joi = require("joi")
const UserSchema = new mongoose.Schema({

    userName:{
        type: String ,
        required : true , 
        trim : true , 
        minlength : 3 ,
        maxlength : 15 
    },
    userEmail:{
        type : String , 
        required : true , 
        trim : true , 
        minlength : 3 ,
        unique : true , 
    },
    password :{
        type : String , 
        required : true , 
        trim : true , 
        minlength : 3 ,
       
    },
    isAdmian : {
        type : Boolean , 
        default : false
    },
    cart:[
        {
        productId :  {type : mongoose.Schema.Types.ObjectId , ref : "Product" , required : true},
        quantity :   {type: Number, default: 1 }
        }
    ],
    wishList:[
        {
        productId :  {type : mongoose.Schema.Types.ObjectId , ref : "Product" , required : true},
        }
    ]
        
    

},{timestamps:true})

function registerValidation(obj){
    const Schema = joi.object({
        userName : joi.string().trim().required().min(6).max(15),
        userEmail : joi.string().trim().required().email(),
        password : joi.string().trim().required().min(6).max(13)
    })

    const {error} = Schema.validate(obj)
    return {error}
}
function  signUpValidation(obj){
    const Schema = joi.object({
        userEmail : joi.string().trim().required().email(),
        password : joi.string().trim().required().min(6)
    })

    const {error} = Schema.validate(obj)
    return {error}
}




const User = mongoose.model("User",UserSchema)
module.exports = {
    User ,
    registerValidation,
    signUpValidation
}
