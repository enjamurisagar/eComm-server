import Product from "../models/productModel.js";

export const createProduct = async (req, res) => {
  try {
    console.log(req.body);
    const {
      category,
      subCategory,
      productName,
      price,
      discount,
      productDescription,
      productImagePath,
      size,
      stock,
    } = req.body;
    const isProductPresent = await Product.find({ category, productName });
    if (isProductPresent.length) {
      return res.status(401).json({
        msg: "Product already present with same category and product name",
      });
    }
    const newProduct = new Product({
      category,
      subCategory,
      productName,
      price,
      discount,
      productDescription,
      productImagePath,
      size,
      stock,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
};

//get all products

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

//post the review

export const postProductReview = async (req, res) => {
  try {
    const id = req.params.id;
    const { picturePath, fullName, rating, message } = req.body;
    const product = await Product.findById(id);

    //reviews updating
    const reviews = product.reviews;
    const updatedReviews = [
      ...reviews,
      { rating, message, picturePath, fullName },
    ];
    product.reviews = updatedReviews;

    //ratings calc

    let sum = 0;
    product.reviews.map((review) => (sum = sum + review.rating));
    product.rating = sum / product.reviews.length;
    await product.save();
    res.status(201).json("success");
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
