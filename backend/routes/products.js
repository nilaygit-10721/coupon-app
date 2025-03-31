const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
const { addProduct, getAllProducts } = require("../controllers/products");

// POST /api/products - Add new product
router.post("/", addProduct);

// GET /api/products - Get all products
router.get("/", getAllProducts);
// GET /api/products/compare?productIds=id1,id2,id3
router.get("/compare", async (req, res) => {
  try {
    const { productIds } = req.query;
    if (!productIds)
      return res.status(400).json({ error: "productIds required" });

    const ids = productIds.split(",");
    const products = await Product.find({ _id: { $in: ids } });

    if (products.length < 2) {
      return res.status(400).json({ error: "At least 2 products required" });
    }

    // Calculate best deal (lowest price)
    const bestDeal = products.reduce((prev, current) =>
      prev.price < current.price ? prev : current
    );

    res.json({
      products,
      bestDeal: {
        productId: bestDeal._id,
        title: bestDeal.title,
        price: bestDeal.price,
        source: bestDeal.source,
      },
      priceDifference: products[0].price - products[1].price, // Example comparison
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
