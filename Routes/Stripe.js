const express = require("express")
const router = express.Router()
const asyncHandler = require("express-async-handler")
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


router.post("/stripe", asyncHandler(
    async(req,res)=>{

        let {price} = req.body
        let {productsNames} = req.body
    



   const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productsNames.join(" ") ,
              description: "Just for testing checkout",
            },
            unit_amount: Number(price*100), 
          },
          quantity: 1,
        },
      ],
        success_url: `http://localhost:5000/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5000/cancel.html`,
    });

    res.json({ url: session.url , sessionId:session.id }); 





    }
))








router.get("/session/:id", asyncHandler(async (req, res) => {
  const sessionId = req.params.id;

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent" ,"line_items.data.price.product"],
  });

  res.json(session);
}));




















module.exports = router