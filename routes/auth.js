import User from "../models/userModel.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//controllers
import {
  login,
  register,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  updateUser,
  removeFromCart,
} from "../controllers/auth.js";

const router = express.Router();

// /auth/login
router.post("/login", login);

router.post("/addToCart/:authId", addToCart);

router.post("/incrementCartItem/:authId", incrementCartItem);
router.post("/decrementCartItem/:authId", decrementCartItem);

router.post("/removeFromCart/:authId", removeFromCart);

export default router;
