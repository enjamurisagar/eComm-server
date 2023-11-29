import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: {
      required: true,
      type: String,
    },
    subCategory: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    productDescription: {
      type: String,
      default: "",
    },
    productImagePath: {
      type: Array,
      default: [],
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 4,
    },
    reviews: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("products", productSchema);

export default Product;
