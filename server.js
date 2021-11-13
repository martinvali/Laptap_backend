const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const path = require("path");

let ejs = require("ejs");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const price = 3900;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

  res.setHeader("Content-Type", "application/json");

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
  res.setHeader("Content-Type", "application/json");

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

  res.setHeader("Content-Type", "text/plain");

  switch (paymentIntent.status) {
    case "succeeded":
      res.render("payment.ejs", {
        msg: "Makse õnnestus!",
        msgSecondary:
          "Teie e-posti saabub mõne minuti jooksul makset kinnitav kiri ning teiega võetakse kahe tööpäeva jooksul ühendust, et täpsustada tellimuse transpordiaega. Probleemide korral palume võtta ühendust meie klienditeenindusega.",
        img: "success.svg",
      });
      break;
    case "processing":
      res.render("payment.ejs", {
        msg: "Teie makset töödeldakse.",
        msgSecondary:
          "Palun värskendage lehte mõne minuti mõõdudes, et näha, kas makse on õnnestunud. Probleemi jätkumisel palume võtta ühendust meie klienditeenindusega.",
        img: "wait.svg",
      });
      break;
    case "requires_payment_method":
      res.render("payment.ejs", {
        msg: "Makse ei õnnestunud. Palun proovige uuesti.",
        msgSecondary:
          "Probleemi jätkumisel palume võtta ühendust meie klienditeenindusega",
        img: "error.svg",
      });
      break;
    default:
      res.render("payment.ejs", {
        msg: "Midagi läks valesti. Palun proovige uuesti.",
        msgSecondary:
          "Probleemi jätkumisel palume võtta ühendust meie klienditeenindusega",
        img: req.url + "error.svg",
      });
      break;
  }
});

app.post("/payment-completed", async function (req, res) {
  const event = req.body;
  if (event.type === "charge.succeeded") {
    console.log("succeeded");
  }
  console.log(event.data.object.metadata.phone);
});

app.listen(PORT, function () {
  console.log("Listening on port 3000");
});
