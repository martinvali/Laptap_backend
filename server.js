const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "https://laptap.netlify.app/",
  optionsSuccessStatus: 200,
};
app.get("/create-checkout-session", cors(corsOptions), async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 5000,
    currency: "eur",
    payment_method_types: [
      "giropay",
      "eps",
      "p24",
      "sofort",
      "sepa_debit",
      "card",
      "bancontact",
      "ideal",
    ],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.listen(PORT, function () {
  console.log("LIstening on port 3000");
});
