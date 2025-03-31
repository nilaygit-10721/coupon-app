const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    discountPercentage: Number,
    imageUrl: String,
    productUrl: { type: String, required: true },
    source: {
      type: String,
      required: true,
      enum: ["amazon", "flipkart", "myntra"],
      lowercase: true,
    },
    category: String,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
