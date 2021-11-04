const stripe = require("stripe")(
  "sk_test_51JktFJH7IkGhuWpe6Emppfpum3BPubj2gB9qf9aQAvuKMPBSbKdxyTqTWwFdn2jh4Qo9ndrjfO073oUzRTJh4jCF0071aQ6keV"
);
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (e.g. pr_1234) of the product you want to sell
        price: "price_1Js9jXH7IkGhuWpe64ZvME16",
        quantity: 1,
      },
    ],
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `https://www.delfi.ee/`,
    cancel_url: `https://www.postimees.ee/`,
  });

  res.redirect(303, session.url);
});

app.listen(PORT, function () {
  console.log("LIstening on port 3000");
});
