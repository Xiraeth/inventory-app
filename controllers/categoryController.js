const Category = require("../models/category");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.categoriesList = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}).sort({ name: 1 }).exec();

  res.render("categories_list", {
    title: "Categories",
    categories_list: allCategories,
  });
});

exports.category_details = asyncHandler(async (req, res, next) => {
  const cat = await Category.findById(req.params.id).exec();
  const allProductsInCat = await Product.find({ category: cat })
    .sort({ name: 1 })
    .exec();

  res.render("category_details", {
    title: "Category Details",
    category: cat,
    products: allProductsInCat,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", {
    title: "Add category",
  });
});

exports.category_create_post = [
  body("name", "Name field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Add category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (categoryExists) {
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, allProductsInCategory] = await Promise.all([
    Category.findById(req.params.id),
    Product.find({ category: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (category === null) res.redirect("home/categories");

  res.render("category_delete", {
    title: "Delete category",
    category: category,
    products: allProductsInCategory,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, allProductsInCategory] = await Promise.all([
    Category.findById(req.params.id),
    Product.find({ category: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (allProductsInCategory > 0) {
    res.render("category_delete", {
      title: "Delete category",
      category: category,
      products: allProductsInCategory,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryID);
    res.redirect("/home/categories");
  }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  res.render("category_form", {
    title: "Edit category",
    category: category,
  });
});

exports.category_update_post = [
  body("name", "Name field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description field cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Edit category",
        category: category,
        errors: errors,
      });
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      );
      res.redirect(updatedCategory.url);
    }
  }),
];
