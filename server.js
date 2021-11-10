const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;
const price = 39;
const corsOptions = {
  origin: "https://laptap.netlify.app",
  optionsSuccessStatus: 200,
};

const calculateAmount = (quantity) => {
  return quantity * price;
};
app.post("/create-checkout-session", cors(corsOptions), async (req, res) => {
  try {
    const { quantity } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateAmount(quantity),
      currency: "eur",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    res.send(e);
  }
});

app.get("/after-payment", async (req, res) => {});

app.listen(PORT, function () {
  console.log("LIstening on port 3000");
});
