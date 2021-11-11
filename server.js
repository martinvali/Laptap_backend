const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const price = 39000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const calculateProductsPrice = (quantity) => {
  return quantity * price;
};

const calculateTransportPrice = (transport) => {
  if (transport === "tasuta") return 0;
  else if (transport !== "tasuta") return 450;
};

const calculateTotalPrice = (quantity, transport) => {
  return calculateProductsPrice(quantity) + calculateTransportPrice(transport);
};

app.post("/payment-intent", async (req, res) => {
  const { quantity } = req.body || 1;
  const { transport } = req.body || "10696";
  const transportPrice = calculateTransportPrice(transport);
  const productsPrice = calculateProductsPrice(quantity);
  const amount = calculateTotalPrice(quantity, transport);
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    payment_method_types: ["card"],
  });

  res.send({
    quantity,
    id: paymentIntent.id,
    unitPrice: price / 1000,
    productsPrice: productsPrice / 1000,
    transportPrice: transportPrice / 1000,
    totalPrice: amount / 1000,
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/payment-intent/:id", async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body || 1;
  const { transport } = req.body || "10696";
  const transportPrice = calculateTransportPrice(transport);
  const productsPrice = calculateProductsPrice(quantity);
  const amount = calculateTotalPrice(quantity, transport);

  const paymentIntent = await stripe.paymentIntents.update(id, {
    amount: calculateAmount(quantity),
  });

  res.send({
    quantity,
    unitPrice: price / 1000,
    productsPrice: productsPrice / 1000,
    transportPrice: transportPrice / 1000,
    totalPrice: amount / 1000,
  });
});

app.listen(PORT, function () {
  console.log("Listening on port 3000");
});
