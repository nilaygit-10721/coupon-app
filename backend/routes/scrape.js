const express = require("express");
const router = express.Router();
const scrapeAmazon = require("../utils/amazonScraper");
const scrapeFlipkart = require("../utils/flipkartScraper");

// GET /api/scrape/amazon?query=laptop
router.get("/amazon", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Query parameter is required" });

    const products = await scrapeAmazon(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scrape/flipkart?query=phone
router.get("/flipkart", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Query parameter is required" });

    const products = await scrapeFlipkart(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
