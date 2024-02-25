const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  numberInStock: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

ProductSchema.virtual("url").get(function () {
  return `/home/product/${this._id}`;
});

module.exports = mongoose.model("Product", ProductSchema);
