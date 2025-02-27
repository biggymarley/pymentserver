const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const env = require("dotenv").config({ path: "./.env" });
const corsOptions = {
  origin: process.env.ORIGIN,
};
const storename = "deals4deals";
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.json());

// Replace if using a different env file or config
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

// app.use(express.static(process.env.STATIC_DIR));

app.get("/api/", (req, res) => {
  res.send("path");
});

app.get("/api/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/api/sendconfirmation", async (req, res) => {
  try {
    console.log(req.body, "body");
    const msg = {
      to: req.body.to, // Change to your recipient
      from: {
        name: `${storename}`,
        email: `contact@${storename}.shop`,
      }, // Change to your verified sender
      subject: `Thank You for Your Purchase from ${storename}!`,
      text: `Thank you for choosing ${storename} for your recent purchase! We truly appreciate your support and are delighted to have you as a valued customer. Your order has been successfully processed, and we are currently preparing it for shipment. You will receive another email with tracking information once your order has been shipped. If you have any questions or need further assistance, please do not hesitate to contact our customer support team at contact@${storename}.shop Thank you again for your purchase. We hope you enjoy your new products! Best regards, The ${storename} Team`,
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thank You for Your Purchase</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      .container {
        width: 80%;
        margin: auto;
        padding: 20px;
        border: 1px solid #ccc;
        background-color: #f9f9f9;
      }
      .header {
        text-align: center;
        padding: 10px 0;
      }
      .content {
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Thank You for Your Purchase from ${storename}!</h1>
      </div>
      <div class="content">
        
        <p>
          Thank you for choosing ${storename} for your recent purchase! We truly
          appreciate your support and are delighted to have you as a valued
          customer.
        </p>
        <p>
          Your order has been successfully processed, and we are currently
          preparing it for shipment.
        </p>
        <p>
          You will receive another email with tracking information once your
          order has been shipped. If you have any questions or need further
          assistance, please do not hesitate to contact our customer support
          team at
          <a href="mailto:contact@${storename}.shop">contact@${storename}.shop</a>
         .
        </p>
        <p>
          Thank you again for your purchase. We hope you enjoy your new
          products!
        </p>
      </div>
      <div class="footer">
        <p>Best regards,</p>
        <p>
          The ${storename} Team<br />
          <a href="https://www.${storename}.shop/">https://www.${storename}.shop/</a><br />
        </p>
      </div>
    </div>
  </body>
</html>
`,
    };
    const resd = await sgMail.send(msg);
    console.log(resd);
    return res.status(200).send({ message: "Email sent successfully" });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message ?? "Invalid",
      },
    });
  }
});

app.post("/api/contactus", async (req, res) => {
  try {
    console.log(req.body, "body");
    const msg = {
      to: "jhontho55@gmail.com",
      from: {
        name: req.body.name,
        email: `contact@${storename}.shop`,
      },
      subject: req.body.subject,
      text: req.body.message,
      html: `${req.body.message} email: ${req.body.email}`,
    };
    const resd = await sgMail.send(msg);
    return res.status(200).send({ message: "Email sent successfully" });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message ?? "Invalid",
      },
    });
  }
});

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    console.log(req.body, "body");
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount: req?.body?.totalPrice ?? 5200,
      automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
