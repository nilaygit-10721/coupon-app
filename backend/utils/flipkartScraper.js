const puppeteer = require("puppeteer");
const Product = require("../models/Product");

async function scrapeFlipkart(query) {
  console.log(`Starting Flipkart scraping for query: ${query}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1366, height: 768 },
  });
  const page = await browser.newPage();

  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(
      query
    )}`;
    console.log(`Navigating to: ${url}`);

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Handle popup if present
    try {
      await page.waitForSelector('button[class*="2KpZ6l"]', { timeout: 3000 });
      await page.click('button[class*="2KpZ6l"]');
      console.log("Attempted to close popup");
    } catch (e) {
      console.log("No popup found or couldn't close it");
    }

    // Use page.waitFor instead of page.waitForTimeout for older Puppeteer versions
    await page.waitFor(2000);

    // Save screenshot for debugging
    await page.screenshot({ path: "flipkart-debug.png", fullPage: true });
    console.log("Screenshot saved to flipkart-debug.png");

    // Extract product using more general selectors
    const products = await page.evaluate(() => {
      const items = [];

      // Look for elements that look like product cards
      const allElements = Array.from(document.querySelectorAll("div"));

      // Find elements that might be product cards
      const productCards = allElements.filter((el) => {
        const hasImage = el.querySelector("img") !== null;
        const hasPrice = el.innerText.includes("₹");
        const hasContent = el.innerText.length > 20;

        return hasImage && hasPrice && hasContent;
      });

      console.log(`Found ${productCards.length} potential product cards`);

      // Process only the first product for testing
      if (productCards.length > 0) {
        const card = productCards[0];

        // Extract product details
        const allImages = card.querySelectorAll("img");
        const imageUrl = allImages.length > 0 ? allImages[0].src : null;

        // Extract price
        const text = card.innerText;
        let price = null;
        const priceMatch = text.match(/₹([0-9,]+)/);
        if (priceMatch && priceMatch[1]) {
          price = parseFloat(priceMatch[1].replace(/,/g, ""));
        }

        // Extract title
        const lines = text.split("\n").filter((line) => line.trim().length > 0);
        const title = lines.length > 0 ? lines[0].trim() : null;

        // Extract product URL
        const links = card.querySelectorAll("a");
        let productUrl = null;
        for (const link of links) {
          if (link.href && link.href.includes("/product/")) {
            productUrl = link.href;
            break;
          }
        }

        if (title && price) {
          items.push({
            title,
            price,
            originalPrice: price * 1.1,
            discountPercentage: 10,
            imageUrl,
            productUrl,
            source: "flipkart",
          });
        }
      }

      return items;
    });

    console.log(`Found ${products.length} products to save`);

    if (products.length > 0) {
      console.log(
        `✅ Scraped product: ${JSON.stringify(products[0], null, 2)}`
      );
      return products;
    } else {
      console.log("No products found. Trying a simpler extraction method...");

      // Try a more targeted approach for finding laptop products
      const simpleProduct = await page.evaluate(() => {
        // Look specifically for product titles and prices
        const titles = Array.from(
          document.querySelectorAll('div[class*="_4rR01T"], a[class*="s1Q9rs"]')
        ).map((el) => el.innerText);

        const prices = Array.from(
          document.querySelectorAll('div[class*="_30jeq3"]')
        ).map((el) => el.innerText);

        const images = Array.from(
          document.querySelectorAll(
            'img[class*="_396cs4"], img[class*="_2r_T1I"]'
          )
        ).map((el) => el.src);

        if (titles.length > 0 && prices.length > 0) {
          return {
            title: titles[0],
            price: parseFloat(prices[0].replace(/[^0-9]/g, "")),
            imageUrl: images[0] || null,
            source: "flipkart",
          };
        }
        return null;
      });

      if (simpleProduct) {
        simpleProduct.originalPrice = simpleProduct.price * 1.1;
        simpleProduct.discountPercentage = 10;
        simpleProduct.productUrl = url;
        console.log(
          `✅ Scraped simple product: ${JSON.stringify(simpleProduct, null, 2)}`
        );
        return [simpleProduct];
      }

      // Last resort - return a placeholder
      return [
        {
          title: `${query} - Placeholder`,
          price: 29999,
          originalPrice: 32999,
          discountPercentage: 10,
          imageUrl: null,
          productUrl: url,
          source: "flipkart",
          note: "Placeholder. Actual scraping failed.",
        },
      ];
    }
  } catch (error) {
    console.error("❌ Flipkart scraping failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeFlipkart;
