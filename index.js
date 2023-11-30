import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
//routes import
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/product.js";

//controllers
import { register } from "./controllers/auth.js";
import { createProduct } from "./controllers/product.js";
import { updateUser } from "./controllers/auth.js";

//tokens
import { verifyAdminToken } from "./middleware/admin.js";
import Product from "./models/productModel.js";
//stripe
import Stripe from "stripe";

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url); //we include this only when we use type:"module" in package.json
const __dirname = path.dirname(__filename); //we include this only when we use type:"module" in package.json

dotenv.config();
const app = express();
// app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.static(__dirname + "public/assets"));
app.use("/assets", express.static("public/assets")); //setting the assets in public folder

//FILE STORAGE

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

//routes with files
app.post(
  "/admin/products/new",
  verifyAdminToken,
  upload.array("productPicture"),
  createProduct
);
app.post("/auth/register", upload.single("picture"), register);
app.post("/auth/updateUser/:authId", upload.single("picture"), updateUser);

//routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);

//mongo connection

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(process.env.PORT, () => console.log("server running on 5000"))
  )
  .catch((err) =>
    console.log("COnnection failed with mongodb => " + err.message)
  );

app.get("/", (req, res) => {
  res.json({
    name: "Enjamuri Sagar",
  });
});
// app.get("/e", (req, res) => {
//   res.json({
//     name: " Another Enjamuri Sagar",
//   });
// });

// app.post("/ssa", verifyAdminToken, async (req, res) => {
//   try {
//     res.json({
//       msg: "Access Accepted",
//     });
//   } catch (error) {
//     res.json({
//       msg: "Access denied",
//     });
//   }
// });

//stripe

const calculateTotalPrice = (cartItems) => {
  let totalPrice = 0;
  for (let item in cartItems) {
    totalPrice += item.product.price * item.productCountInCart;
  }
  return totalPrice;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// app.get("/config", (req, res) => {
//   res.send({
//     publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//   });
// });

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalPrice } = req.body;

    console.log("qdad ", totalPrice);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,

      currency: "inr",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      // payment_method_types: paymentMethodTypes,
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});
