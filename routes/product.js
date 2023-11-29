import express from "express";
import Product from "../models/productModel.js";
import { getAllProducts, postProductReview } from "../controllers/product.js";

const router = express.Router();

router.get("/", getAllProducts);

router.post("/product/review/:id", postProductReview);

export default router;
