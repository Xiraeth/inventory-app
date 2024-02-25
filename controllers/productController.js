const Category = require("../models/category");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [numberOfProducts, numberOfCategories] = await Promise.all([
    Category.countDocuments({}).exec(),
    Product.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory management app",
    num_products: numberOfProducts,
    num_categories: numberOfCategories,
  });
});

exports.productsList = asyncHandler(async (req, res, next) => {
  const allProducts = await Product.find({})
    .populate("category")
    .sort({ name: 1 })
    .exec();

  res.render("products_list", {
    title: "Products in Store",
    products_list: allProducts,
  });
});

exports.product_details = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .exec();

  res.render("product_details", {
    title: "Product details",
    product: product,
  });
});

exports.product_create_get = asyncHandler(async (req, res, next) => {
  // Find all categories to have the user select one of them for the product
  const allCategories = await Category.find({}).exec();

  res.render("product_form", {
    title: "Add product",
    categories: allCategories,
  });
});

exports.product_create_post = [
  body("name", "Name field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price field cannot be empty")
    .trim()
    .isFloat({ min: 1 })
    .escape(),
  body("description", "Description field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("numberInStock", "Needs to be filled out and be a number greater than 0")
    .trim()
    .isInt({ min: 1 })
    .escape(),
  body("category", "Category must be set").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      numberInStock: req.body.numberInStock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find({}).exec();

      res.render("product_form", {
        title: "Add product",
        categories: allCategories,
        product: product,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await product.save();
      res.redirect(product.url);
    }
  }),
];

exports.product_delete_get = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .exec();

  if (product === null) res.redirect("/catalog/products");

  res.render("product_delete", {
    title: "Delete product",
    product: product,
  });
});

exports.product_delete_post = asyncHandler(async (req, res, next) => {
  await Product.findByIdAndDelete(req.body.productID);
  res.redirect("/home/products");
});

exports.product_update_get = asyncHandler(async (req, res, next) => {
  const [product, allCategories] = await Promise.all([
    await Product.findById(req.params.id),
    await Category.find({}).sort({ name: 1 }).exec(),
  ]);

  res.render("product_form", {
    title: "Edit product",
    product: product,
    categories: allCategories,
  });
});

exports.product_update_post = [
  body("name", "Name field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price field cannot be empty")
    .trim()
    .isFloat({ min: 1 })
    .escape(),
  body("description", "Description field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("numberInStock", "Needs to be filled out and be a number greater than 0")
    .trim()
    .isInt({ min: 1 })
    .escape(),
  body("category", "Category must be set").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      numberInStocke: req.body.numberInStock,
      category: req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find({}).exec();

      res.render("product_form", {
        title: "Add product",
        categories: allCategories,
        product: product,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        product,
        {}
      );
      res.redirect(updatedProduct.url);
    }
  }),
];
