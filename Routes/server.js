const express = require("express")
const router = express.Router()
const asyncHandler = require("express-async-handler")
const client = require("../paypalConfig.js")
const paypal = require('@paypal/checkout-server-sdk');






router.post("/payment", asyncHandler(
    async(req ,res)=>{

       const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE', 
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '500.00', 
          },
            payee: {
        email_address: "sb-bsotz47439106@business.example.com" 
      }
        },
        
      ],

       application_context: {
      brand_name: "Test Store",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: "http://localhost:5000/success",
      cancel_url: "http://localhost:5000/cancel"
    }


    });


    const order = await client.execute(request);
    const approveUrl = order.result.links.find(link => link.rel === 'approve').href;
    res.json({ id: order.result.id  , approveUrl }); 
    }
))


router.post("/payment/accept",asyncHandler(
    async(req,res)=>{

    const { orderID } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);
    res.json({ capture: capture.result });


    }
))














module.exports = router
