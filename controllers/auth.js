import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import fs from "fs";
import { promisify } from "util";

const unlinkProm = promisify(fs.unlink);

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, picturePath } =
      req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHashed,
      location,
      picturePath,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    console.log("successfully registered with email -> " + savedUser.email);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "user does not exist" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(400).json({ msg: "password does not match" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//add to cart

export const addToCart = async (req, res) => {
  try {
    const { authId } = req.params;

    const { product, productCount } = req.body;
    console.log(req.body);

    const user = await User.findById(authId);
    if (!user) {
      return res.status(404).send({ msg: "No user found" });
    }

    const cartOld = user.cart;

    const isProductAlreadyPresent = cartOld?.filter(
      (prod) => prod.product._id === product._id
    );

    if (isProductAlreadyPresent.length) {
      const updatedCart = cartOld?.map((prod) => {
        return prod.product._id === product._id
          ? {
              ...prod,
              productCountInCart: prod.productCountInCart + productCount,
            }
          : { ...prod };
      });
      user.cart = updatedCart;
    } else {
      cartOld.push({ product, productCountInCart: productCount });

      user.cart = cartOld;
    }

    await user.save();

    res.status(200).send(user.cart);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//increment cart item

export const incrementCartItem = async (req, res) => {
  try {
    const { authId } = req.params;
    const { productId } = req.body;

    const user = await User.findById(authId);

    if (!user) {
      return res.status(404).send({ msg: "No user found" });
    }

    const cart = user.cart;

    const updatedCart = cart.map((cartItem) => {
      return cartItem.product._id === productId
        ? { ...cartItem, productCountInCart: cartItem.productCountInCart + 1 }
        : { ...cartItem };
    });

    user.cart = updatedCart;

    await user.save();

    res.status(201).json(user.cart);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const decrementCartItem = async (req, res) => {
  try {
    const { authId } = req.params;
    const { productId } = req.body;

    const user = await User.findById(authId);

    if (!user) {
      return res.status(404).send({ msg: "No user found" });
    }

    const cart = user.cart;

    const updatedCart = cart.map((cartItem) => {
      return cartItem.product._id === productId &&
        cartItem.productCountInCart > 0
        ? { ...cartItem, productCountInCart: cartItem.productCountInCart - 1 }
        : { ...cartItem };
    });

    user.cart = updatedCart.filter(
      (cartItem) => cartItem.productCountInCart > 0
    );

    await user.save();

    res.status(201).json(user.cart);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//remove item from cart

export const removeFromCart = async (req, res) => {
  try {
    const { authId } = req.params;
    const { productId } = req.body;
    console.log(productId, authId);

    const user = await User.findById(authId);
    if (!user) return res.status(404).send({ msg: "No user found" });

    const cartUpdated = user?.cart.filter(
      (cartItem) => cartItem?.product?._id !== productId
    );

    user.cart = cartUpdated;

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//changeProfilePic
export const updateUser = async (req, res) => {
  try {
    const { authId } = req.params;

    const user = await User.findById(authId);
    const oldPicturePath = user?.picturePath;
    console.log(authId);
    console.log(req.body);
    console.log(oldPicturePath);
    if (!user) {
      return res.status(400).json("No user found");
    }

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.picturePath = req.body.picturePath;
    user.location = req.body.location;

    //deleting old picture

    // fs.unlinkSync("public/assets/" + oldPicturePath);
    // console.log("deleted old picture");
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
