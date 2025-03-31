const puppeteer = require("puppeteer");
const Product = require("../models/Product");

async function scrapeAmazon(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to Amazon search
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Extract product data
    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll(".s-result-item").forEach((item) => {
        const title = item.querySelector("h2")?.innerText.trim();
        const priceText = item
          .querySelector(".a-price-whole")
          ?.innerText.replace(/[^0-9]/g, "");
        const price = priceText ? parseFloat(priceText) : null;
        const imageUrl = item.querySelector("img.s-image")?.src;
        const productUrl = item.querySelector("a.a-link-normal")?.href;

        if (title && price) {
          items.push({
            title,
            price,
            originalPrice: price * 1.1, // Example: Assume 10% discount
            discountPercentage: 10,
            imageUrl,
            productUrl: `https://www.amazon.in${productUrl}`,
            source: "amazon",
          });
        }
      });
      return items;
    });

    // Save to MongoDB
    await Product.insertMany(products);
    console.log(`✅ Scraped & saved ${products.length} Amazon products`);

    return products;
  } catch (error) {
    console.error("❌ Amazon scraping failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeAmazon;
