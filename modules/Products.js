const moongose = require("mongoose");
const joi = require("joi") 

const productSchema = new moongose.Schema({
    productName :  {
        type : String ,
        require : true , 
        minlength : 1 , 
        maxlength : 30 , 
        trim : true , 
    },
    quantity:{
        type : Number,
        default : 1 ,
        require : true, 
    },
    productDescription :{
        type : String ,
        require : true , 
        minlength : 3 , 
        maxlength : 250 , 
        trim : true ,
    },
    isSale : {
        type : Boolean ,
        default : false
    },
    image : {
        type : String , 
        require : false , 
        trim : true ,
        default : " imge url "
    },
    price : {
        type : Number , 
        require : true , 
        trim : true
    },
    salePercentage : {
        type : Number , 
        require : false , 
        trim : true , 
        default : "" , 
    },currencyType:{
         type: String,
  enum: ['USD', 'EUR', 'EGP'], 
  required: true
        
    },
    category: { type: String
        , enum: ["Electronics", "Clothing", "Food", "Books","Drink"]
        , required: true 
    },
    rating:[
        {
       rate :  { type: Number, default: 0 ,  enum: [0,1,2,3,4,5] },
       userId:  {  type : moongose.Schema.Types.ObjectId , ref: "User", required: true }
        }

    ],
    totalRates:{
         type: Number,
          default: 0 ,
    },
    comments:[
        {
            userId : {  type : moongose.Schema.Types.ObjectId , ref: "User", required: true },
            theComment :{type : String ,trim : true  },
            createdAt: { type: Date, default: Date.now },
            like : [{userId : {type : moongose.Schema.Types.ObjectId , ref: "User", }} ],
            disLike :[ {userId : {type : moongose.Schema.Types.ObjectId , ref: "User", }} ], 
        }
    ]
       
        

},{timestamps : true})
function validateProduct(obj){
    const Schema = joi.object({

        productName : joi.string().required().trim().min(1).max(30),
        productDescription : joi.string().required().trim().min(3).max(250),
        isSale : joi.boolean(),
        image :  joi.string().required().trim(),
        price :  joi.required(),
        salePercentage : joi.number().min(0).max(100),
        currencyType: joi.string().valid('USD', 'EUR', 'EGP').required(),
        category: joi.string().valid("Electronics", "Clothing", "Food", "Books","Drink").required(),
        rating: joi.string().valid(0,1,2,3,4,5),
        quantity: joi.number().required().min(1)

    })

    const {error} = Schema.validate(obj)
    return {error}

}
function validateProductUpate(obj){
    const Schema = joi.object({

        productName : joi.string().trim().min(1).max(30),
        productDescription : joi.string().trim().min(3).max(250),
        isSale : joi.boolean(),
        image :  joi.string().trim(),
        price :  joi

    })

    const {error} = Schema.validate(obj)
    return {error}

}


let Product = moongose.model("Product", productSchema)

module.exports = {
    Product,
    validateProduct,
    validateProductUpate
}
