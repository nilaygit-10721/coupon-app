const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Product = require("../models/Product"); // MongoDB Product Model

puppeteer.use(StealthPlugin());

async function scrapeFlipkart(query) {
  const browser = await puppeteer.launch({
    headless: true, // Change to false if debugging
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    // Set User-Agent to prevent bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Navigate to Flipkart search results
    const flipkartURL = `https://www.flipkart.com/search?q=${encodeURIComponent(
      query
    )}`;
    await page.goto(flipkartURL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for product list
    await page.waitForSelector("div.cPHDOP", { timeout: 30000 });

    // Extract product details
    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("div.cPHDOP").forEach((product) => {
        const titleElement = product.querySelector(".KzDlHZ");
        const priceElement = product.querySelector("div.Nx9bqj");
        const discountElement = product.querySelector("div.UkUFwK span");
        const linkElement = product.querySelector("a.CGtC98");
        const imageElement = product.querySelector("img.DByuf4");

        if (titleElement && priceElement && linkElement) {
          const priceText = priceElement.innerText.replace(/[^0-9]/g, ""); // Remove non-numeric chars
          const price = priceText ? parseFloat(priceText) : null;

          items.push({
            title: titleElement.innerText.trim(),
            price,
            originalPrice: price ? price * 1.1 : null, // Assume 10% discount for calculation
            discountPercentage: discountElement
              ? parseInt(discountElement.innerText.replace("%", ""))
              : 0,
            imageUrl: imageElement ? imageElement.src : null,
            productUrl:
              "https://www.flipkart.com" + linkElement.getAttribute("href"),
            source: "flipkart",
          });
        }
      });
      return items;
    });

    // Save scraped data to MongoDB
    if (products.length > 0) {
      await Product.insertMany(products);
      console.log(`✅ Scraped & saved ${products.length} Flipkart products`);
    } else {
      console.log("⚠ No products found.");
    }

    return products;
  } catch (error) {
    console.error("❌ Flipkart scraping failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeFlipkart;
