const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const price = 49;
const calculateOrderAmount = (quantity = 1) => {
  return quantity * price;
};
app.get("/create-checkout-session", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 49,
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
