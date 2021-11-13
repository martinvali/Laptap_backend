const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const price = 3900;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const calculateProductsPrice = (quantity) => {
  return quantity * price;
};

const calculateTransportPrice = (transport) => {
  if (transport === "tasuta" || transport === "") return 0;
  else if (transport !== "tasuta" && transport !== "") return 450;
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
    unitPrice: price / 100,
    productsPrice: productsPrice / 100,
    transportPrice: transportPrice / 100,
    totalPrice: amount / 100,
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/payment-intent/prices/:id", async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body || 1;
  const { transport } = req.body || "";
  const transportPrice = calculateTransportPrice(transport);
  const productsPrice = calculateProductsPrice(quantity);
  const amount = calculateTotalPrice(quantity, transport);

  const paymentIntent = await stripe.paymentIntents.update(id, {
    amount: calculateTotalPrice(quantity, transport),
  });

  res.send({
    quantity,
    unitPrice: price / 100,
    productsPrice: productsPrice / 100,
    transportPrice: transportPrice / 100,
    totalPrice: amount / 100,
  });
});

app.post("/payment-intent/metadata/:id", async (req, res) => {
  const id = req.params.id;
  const { fullName } = req.body || "none";
  const { transport } = req.body || "none";
  const { email } = req.body || "none";
  const { phone } = req.body || "none";

  await stripe.paymentIntents.update(id, {
    metadata: {
      fullName,
      transport,
      email,
      phone,
    },
    receipt_email: email,
  });

  return;
});

app.get("/after-payment", async (req, res) => {
  let {
    payment_intent: paymentIntent,
    payment_intent_client_secret: clientSecret,
  } = req.query;

  if (!clientSecret || !paymentIntent) {
    return;
  }

  paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);

  switch (paymentIntent.status) {
    case "succeeded":
      res.send("Payment succeeded!");
      break;
    case "processing":
      res.send("Your payment is processing.");
      break;
    case "requires_payment_method":
      res.send("Your payment was not successful, please try again.");
      break;
    default:
      res.send("Something went wrong.");
      break;
  }
});

app.post("/payment-completed", async function (req, res) {
  const event = req.body;
  if (event.type === "charge.succeeded") {
    console.log("succeeded");
  }
  console.log(event.metadata);
});

app.listen(PORT, function () {
  console.log("Listening on port 3000");
});
