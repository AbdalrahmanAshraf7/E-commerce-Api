const express = require("express")
const router = express.Router()
const allowOnlySpecificUser = require("../middlewares/allowMiddleWare")
const tokenCheck = require("../middlewares/tokenMiddleWare")
const tokenCartCheck = require("../middlewares/cartTokenMiddleWare")
const {Product , validateProduct,validateProductUpate} = require("../modules/Products")
const asyncHandler = require("express-async-handler")
const { default: mongoose } = require("mongoose")
const jwt = require("jsonwebtoken")
const {User} = require("../modules/User")
const {sendNoti} = require("./notifications")




router.post("/products",tokenCheck,allowOnlySpecificUser,asyncHandler(
    async(req,res)=>{
        let {error} = validateProduct(req.body)

        if(error){
        return res.status(400).json({message : error.details[0].message})
        }

        let {productName , productDescription , isSale , image , price , salePercentage ,currencyType ,category ,quantity} = req.body

        let product = new Product(
            {
                productName : productName,
                productDescription :  productDescription,
                isSale : isSale,
                image : image,
                price: isSale ===true ?  price * (1 - (salePercentage / 100)) : price,
                salePercentage :isSale ===true ? salePercentage : 0 ,
                currencyType : currencyType ,
                category :  category ,
                quantity :quantity 
            }
        )

        let results = await  product.save()
        let {sale ,...other} = results._doc
        res.status(200).json({message : "success" ,
                              data : {...other , salePercentage : isSale ===true ? salePercentage + "%" : 0 + "%"  } ,
                              message2 : " سبحان الله وبحمده سبحان الله العظيم "})
    }
))

router.get("/products",asyncHandler(
    async(req,res)=>{
        const {pageNumber  , productPerPage   , productName , category}= req.query ;
        
        let page = Number(pageNumber) || 1 ;
        let productPage = Number(productPerPage) || 6  ;

        if(page < 1 || productPage < 1 ) return res.status(400).json({message : " please enter valid page number and valid product per page"});

        let filter = {};

        if(productName === "")
        if (productName)filter.productName = { $regex: productName, $options: "i" };
        if (category) filter.category = category;

        let numberOfProducts = await Product.countDocuments(filter)
        
        let product = await Product.find(filter).select("-rating").skip((page-1)*productPage).limit(productPage).populate({ path: "comments.userId", select: "userName" });
        let NumberOfProducts = await Product.countDocuments(); 
        if(product.length === 0 ) return res.status(200).json({ counter :  product.length , message : "no products here " });
        
        res.status(200).json({ counter :  product.length ,totalNumberOfProducts : NumberOfProducts , pageNumber : page  , productPerPage : productPage , numberOfPages : Math.ceil( numberOfProducts /productPage )  ,  data :  product});
    }
    
))

router.get("/products/:id",asyncHandler(
    async(req,res)=>{
        let isValid = mongoose.Types.ObjectId.isValid(req.params.id)

    if(!isValid){
        return res.status(404).json({message : "this id format is not true "})
    }

        let product = await Product.findById(req.params.id).populate({ path: "comments.userId", select: "userName" }) ;
         if(product){

            let {comments , ...other} = product._doc

            let everyComment = comments.map((C)=> ({data: C , likeCounter : C.like.length , disLikeCounter : C.disLike.length}))



            res.status(200).json({message: "success" ,
                               data : other , 
                               comments : everyComment
                           
        })

        }else{
            res.status(400).json({message : "this id dosnt exist"})
        }
    }
    
))

// if (isExist.theComment === "" ) return 

router.post("/products/comments/:id",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
        if(!isValid) return res.status(404).json({message : "this id format is not true "})
        let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})

        let product = await Product.findById(req.params.id)
        let isExist = product.comments.find((C)=>C.userId.toString() === req.userId)     
      
        
        if(isExist){
            product.comments = product.comments.filter((C)=> C.userId.toString() !== req.userId)

            product.comments.push({
            userId : new mongoose.Types.ObjectId(req.userId),
            theComment : req.body.theComment
        })

        }else{
            product.comments.push({
            userId : new mongoose.Types.ObjectId(req.userId),
            theComment : req.body.theComment
        })
        }

        product.comments = product.comments?.filter((C)=>C.theComment !== "")
        await product.save()
        await product.populate({ path: "comments.userId", select: "userName" });
        res.json(product);
    }
))

router.delete("/products/comments/:id",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
        if(!isValid) return res.status(404).json({message : "this id format is not true "})
        let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})

        let product = await Product.findById(req.params.id)
        let isExist = product.comments.find((C)=>C.userId.toString() === req.userId)  

        if(isExist){

          product.comments =  product.comments.filter((C)=> C.userId.toString() !== req.userId.toString() )

        }else{

            return res.json("you didnt comment yet")
        }
        
        
       

       await product.save()
       await product.populate({ path: "comments.userId", select: "userName" });
       res.json(product);

    }
))


router.post("/products/like/:id/:ID",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
        if(!isValid) return res.status(404).json({message : "this id format is not true "})
        let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})

            let user = await User.findById(req.params.ID)
            let likedUser = await User.findById(req.userId)
            let product = await Product.findById(req.params.id)
            let isExistComment = product.comments.find((C)=>C.userId.toString() === req.params.ID)  
            
            
        if(!isExistComment) return res.json("this comment donot exist")
        let isExistLike  =   isExistComment.like.find((L)=> L.userId.toString() === req.userId )

        console.log(likedUser._id)





            if(isExistLike){
                isExistComment.like = isExistComment.like.filter((L)=> L.userId.toString() !== req.userId)
            }else{

                isExistComment.like.push(
                  { userId : new mongoose.Types.ObjectId(req.userId)}
                )

                isExistComment.disLike = isExistComment.disLike.filter((L)=> L.userId.toString() !== req.userId)
                sendNoti(user.notificationsPermisson , `"${likedUser.userName}" liked to  your comment : "${isExistComment.theComment}"`)
                user.notifications.push({
                    message :`"${likedUser.userName}" liked to  your comment : "${isExistComment.theComment}"` ,
                    productId : req.params.id ,
                    commentId : isExistComment._id,
                    LikedId : likedUser._id,
                    isReaded : false
                })
            }
            
            product.comments.like = {data : isExistComment.like , counterLikes : isExistComment.like.length}


               
            
            



            
       await user.save()
       await product.save()
       await product.populate({ path: "comments.like.userId", select: "userName" });
       res.json(product.comments.like);

    }
))

router.post("/products/disLike/:id/:ID",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
        if(!isValid) return res.status(404).json({message : "this id format is not true "})
        let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})
            let user = await User.findById(req.params.ID)
            let product = await Product.findById(req.params.id)
            let isExistComment = product.comments.find((C)=>C.userId.toString() === req.params.ID)  
            let likedUser = await User.findById(req.userId)

    

        if(!isExistComment) return res.json("this comment donot exist")
        let isExistLike  =   isExistComment.disLike.find((L)=> L.userId.toString() === req.userId )



            if(isExistLike){
                isExistComment.disLike = isExistComment.disLike.filter((L)=> L.userId.toString() !== req.userId)
            }else{

                isExistComment.disLike.push(
                  { userId : new mongoose.Types.ObjectId(req.userId)}
                )

                isExistComment.like = isExistComment.like.filter((L)=> L.userId.toString() !== req.userId)

                sendNoti(user.notificationsPermisson , `"${likedUser.userName}" disLiked to  your comment : "${isExistComment.theComment}"`)

                user.notifications.push({
                    message :`"${likedUser.userName}" disLiked to  your comment : "${isExistComment.theComment}"` ,
                    productId : req.params.id ,
                    commentId : isExistComment._id,
                    LikedId : likedUser._id,
                    isReaded : false
                })
            }
       await user.save()
       await product.save()
       await product.populate({ path: "comments.like.userId", select: "userName" });
       res.json(product);

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
// let isValid = mongoose.Types.ObjectId.isValid(req.params.id)
        // if(!isValid) return res.status(404).json({message : "this id format is not true "})

router.post("/products/:id",tokenCartCheck,asyncHandler(
    async(req,res)=>{
        
        let isTrueProduct = await Product.findById(req.params.id)
        if(!isTrueProduct) return res.status(400).json({message : " this product dosent exist"})


        let rate = await Product.findById(req.params.id)
        let isRaterd = rate.rating.find((R)=> R.userId.toString() === req.userId.toString())

       const rateValue = Number(req.body.rate);

        if( rateValue === 0 ){
           rate.rating  =  rate.rating.filter((R)=> R.userId.toString() !==  req.userId.toString() ) ; 
            
        
            
        }
        if(isRaterd){
            isRaterd.rate = req.body.rate
        } else{
            rate.rating.push({
            rate : req.body.rate,
            userId : req.userId})
        }

     rate.totalRates = rate.rating.filter((R)=>Number(R.rate) !== 0 ).map((R)=> R.rate).reduce((a,b)=>a+b , 0)/(rate.rating.filter((R) => Number(R.rate) !== 0).length || 1);
     rate.rating =   rate.rating.filter((R)=>Number(R.rate) !== 0 )

      await  rate.save()
 
        
      res.status(200).json(rate.rating)
       
    }
))






module.exports = router
