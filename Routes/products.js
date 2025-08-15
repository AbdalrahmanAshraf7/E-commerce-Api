const express = require("express")
const router = express.Router()
const allowOnlySpecificUser = require("../middlewares/allowMiddleWare")
const tokenCheck = require("../middlewares/tokenMiddleWare")
const {Product , validateProduct,validateProductUpate} = require("../modules/Products")
const asyncHandler = require("express-async-handler")
const { default: mongoose } = require("mongoose")
const jwt = require("jsonwebtoken")



router.post("/products",tokenCheck,allowOnlySpecificUser,asyncHandler(
    async(req,res)=>{
        let {error} = validateProduct(req.body)

        if(error){
        return res.status(400).json({message : error.details[0].message})
        }

        let {productName , productDescription , isSale , image , price , salePercentage ,currencyType} = req.body

        let product = new Product(
            {
                productName : productName,
                productDescription :  productDescription,
                isSale : isSale,
                image : image,
                price: price * (1 - (salePercentage / 100)) ,
                salePercentage :salePercentage,
                currencyType : currencyType ,
            }
        )

        let results = await  product.save()
        let {sale ,...other} = results._doc
        res.status(200).json({message : "success" ,
                              data : {...other , salePercentage :  salePercentage + "%"  } ,
                              message2 : " سبحان الله وبحمده سبحان الله العظيم "})
    }
))

router.get("/products",asyncHandler(
    async(req,res)=>{
        const {pageNumber  , productPerPage}= req.query ;
        let page = Number(pageNumber) ||1 ;
        let productPage = Number(productPerPage) || 6 ;
        
        if(page < 1 ||productPage < 1 ) return res.status(400).json({message : " please enter valied page number and valied product per page"});
        
        let product = await Product.find().skip((page-1)*productPage).limit(productPage);
        let NumberOfProducts = await Product.countDocuments(); 

        if(product.length ===0 )return res.status(200).json({ counter :  product.length , message : "no products here " });
        res.status(200).json({ counter :  product.length ,totalNumberOfProducts : NumberOfProducts , pageNumber : page  , productPerPage : productPage , numberOfPages : Math.ceil( NumberOfProducts /productPage )  ,  data :  product     });
        console.log(product)
    }
))

router.get("/products/:id",asyncHandler(
    async(req,res)=>{
        let isValid = mongoose.Types.ObjectId.isValid(req.params.id)

    if(!isValid){
        return res.status(404).json({message : "this id format is not true "})
    }

        let product = await Product.findById(req.params.id)  ;
         if(product){
            res.status(200).json({message: "success" ,
                               data : product
        })

        }else{
            res.status(400).json({message : "this id dosnt exist"})
        }
    }
    
))


router.delete("/products/:id",tokenCheck,allowOnlySpecificUser,asyncHandler(
  async(req,res)=>{

    let isValid = mongoose.Types.ObjectId.isValid(req.params.id)

    if(!isValid){
        return res.status(404).json({message : "this id format is not true "})
    }

        let product =await Product.findByIdAndDelete(req.params.id)

        if(product){
            res.status(200).json({message: "success" ,
                opretarion : "remove" , 
                               data : product  
        })

        }else{
            res.status(400).json({message : "this id dosnt exist"})
        }

        
    }
))

router.delete("/products",tokenCheck,allowOnlySpecificUser,asyncHandler(
  async(req,res)=>{

    let deleteAll = await Product.deleteMany()
    res.status(200).json({message : "all item deleted successfully !",
                          data : deleteAll



    })
  }
))

router.put("/products/:id",asyncHandler(
    
    async(req,res)=>{

        let {error} = validateProduct(req.body)


        if(error){
        return res.status(400).json({message : error.details[0].message})
        }

         let isValid = mongoose.Types.ObjectId.isValid(req.params.id)

    if(!isValid){
        return res.status(404).json({message : "this id format is not true "})
    }
    
        let product = await Product.findByIdAndUpdate(req.params.id,{
            $set:{
                productName : req.body.productName,
                productDescription : req.body.productDescription,
                isSale : req.body.isSale,
                image : req.body.image,
                price : req.body.price
            }
        },{new: true})

        if(product){
            res.status(200).json({message : "updated successfully !", 
            data: product
        })
        }else{
            res.status(400).json({message : " this id is not correct"})
        }
    }
))






module.exports = router
