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
        trime : true
    },
    salePercentage : {
        type : Number , 
        require : false , 
        trime : true , 
        default : "" , 
    },currencyType:{
         type: String,
  enum: ['USD', 'EUR', 'EGP'], 
  required: true
        
    }

},{timestamps : true})
function validateProduct(obj){
    const Schema = joi.object({

        productName : joi.string().required().trim().min(1).max(30),
        productDescription : joi.string().required().trim().min(3).max(250),
        isSale : joi.boolean(),
        image :  joi.string().required().trim(),
        price :  joi.required(),
        salePercentage : joi.number().min(0).max(100),
        currencyType: joi.string().valid('USD', 'EUR', 'EGP').required()

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
