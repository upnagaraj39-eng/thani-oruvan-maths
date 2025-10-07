import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/create-order', async (req, res) => {
  try {
    const {amount, currency = 'INR', notes = {}} = req.body;
    const order = await razorpay.orders.create({
      amount,
      currency,
      notes
    });
    res.json({ok:true, order});
  } catch (err) {
    console.error(err);
    res.json({ok:false, error:err.message});
  }
});

app.post('/api/verify', (req,res)=>{
  try{
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                           .update(sign.toString())
                           .digest('hex');
    if(expected === razorpay_signature){
      return res.json({ok:true, unlockDays:30});
    }
    res.json({ok:false, error:'Invalid signature'});
  }catch(e){
    res.json({ok:false, error:e.message});
  }
});

app.listen(3000, ()=> console.log('Server running on http://localhost:3000'));
