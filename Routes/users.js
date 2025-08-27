const express = require("express")
const router = express.Router()
const {User} = require("../modules/User")
const allowOnlySpecificUser = require("../middlewares/allowMiddleWare")
const tokenCheck = require("../middlewares/tokenMiddleWare")
const tokenCartCheck = require("../middlewares/cartTokenMiddleWare")
const {Product , validateProduct,validateProductUpate} = require("../modules/Products")
const asyncHandler = require("express-async-handler")
const { default: mongoose } = require("mongoose")
const jwt = require("jsonwebtoken")

router.get("/users", asyncHandler(
    async (req,res)=>{

        let users = await User.find().select("-password")
        res.status(200).json({users})
    }
) )

router.post("/users/cart/:id",tokenCartCheck,asyncHandler(
    async(req,res)=>{
            let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
            if(!isValid){
                return res.status(404).json({message : "this id format is not true "})
            }

            let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})

        let user = await User.findById(req.userId)
        let isExist = user.cart.find((C)=> C.productId.toString() === req.params.id )
        

        if(isExist){
            isExist.quantity++
        }else{
            user.cart.push(
                {productId : req.params.id ,
                 quantity : 1
                }
            )
        }
        user.cart = user.cart.filter(item => item.productId !== null);
        await user.save()
        await user.populate("cart.productId")
        res.status(200).json({message : "success",
            data : await Product.findById(req.params.id).select("-rating"),
            quantity : isExist ? isExist.quantity : 1
        })
    }
))

router.delete("/users/cart/:id",tokenCartCheck,asyncHandler(
    async(req,res)=>{
            let isValid = mongoose.Types.ObjectId.isValid(req.params.id)

    if(!isValid){
        return res.status(404).json({message : "this id format is not true "})
    }
        let user = await User.findById(req.userId).select("-rating")
        let isExist = user.cart.find((C)=> C.productId.toString() === req.params.id)

                let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})
        if (!isExist)return res.status(400).json({message : "this item is not in the cart"})
            if(isExist.quantity > 1 ){
                isExist.quantity--
            }else{
                user.cart = user.cart.filter((C)=> C.productId.toString() !== req.params.id)
            }

            await user.save();
            await user.populate("cart.productId");
user.cart = user.cart.filter(item => item.productId !== null);
            res.status(200).json({message : "success" ,
                                  data : user.cart
            })
    }
))

router.get("/users/cart",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        let user = await User.findById(req.userId).select("-rating")
        await user.populate({
  path: "cart.productId",
  select: "-rating"
})
        user.cart = user.cart.filter(item => item.productId !== null);

       
        
        res.status(200).json({message : " success" ,
            data : user.cart.length === 0 ? [] : user.cart,
            counter : user.cart.length
        } )
    }
))



router.post("/users/wishlist/:id",tokenCartCheck,asyncHandler(
    async(req,res)=>{

            let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
        
            if(!isValid){
                return res.status(404).json({message : "this id format is not true "})
            }

        let user = await User.findById(req.userId)
        let isExist = user.wishList.find((C)=> C.productId.toString() === req.params.id )
        let isTrueProduct = await Product.findById(req.params.id)
        
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})

            if(!isExist){
                user.wishList.push(
                    {productId : req.params.id}
                )
            }else{
                user.wishList = user.wishList.filter((W)=> W.productId.toString() !== req.params.id)
            }


            await user.save();
            await user.populate({path : "wishList.productId",select : "-rating"});
user.wishList = user.wishList.filter(item => item.productId !== null);
            res.status(200).json({message : "success" ,
                                  data : user.wishList
            })
    }
))

router.get("/users/wishlist",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        let user = await User.findById(req.userId).populate({path : "wishList.productId" , select : "-rating"});

        if (user.wishList.length === 0 ) return res.status(200).json({message : "empty wish list" , data : null})

            user.wishList = user.wishList.filter(item => item.productId !== null);

        res.status(200).json({message : "success" ,
            counter : user.wishList.length,
            data : user.wishList
        })
    }
))














module.exports = router
