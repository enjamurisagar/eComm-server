import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      required: true,
      type: String,

      max: 20,
    },
    lastName: {
      required: true,
      type: String,

      max: 20,
    },
    email: {
      required: true,
      type: String,

      max: 40,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    picturePath: {
      type: String,
    },
    location: String,
    cart: {
      type: Array,
      default: [],
    },
    orders: {
      type: Array,
      default: ["productId", "productId", "productId", "productId"],
    },
    pending: {
      type: Array,
      default: [],
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

export default User;
