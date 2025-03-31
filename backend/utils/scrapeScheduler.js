const cron = require("node-cron");
const scrapeAmazon = require("./amazonScraper");
const scrapeFlipkart = require("./flipkartScraper");

// Scrape Amazon for trending products every 6 hours
function startScrapingScheduler() {
  cron.schedule("0 */6 * * *", async () => {
    console.log("🕒 Running scheduled Amazon scrape...");
    try {
      const trendingSearches = ["laptop", "smartphone", "headphones"];
      for (const query of trendingSearches) {
        await scrapeAmazon(query);
      }
      console.log("✅ Scheduled scrape completed");
    } catch (error) {
      console.error("❌ Scheduled scrape failed:", error);
    }
  });
  // Add to cron job
  cron.schedule("0 */6 * * *", async () => {
    console.log("🕒 Running scheduled Flipkart scrape...");
    try {
      await scrapeFlipkart("mobile");
      await scrapeFlipkart("laptop");
    } catch (error) {
      console.error("❌ Flipkart scheduled scrape failed:", error);
    }
  });
}

module.exports = startScrapingScheduler;
