const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const scrapeRoutes = require("./routes/scrape");
const productRoutes = require("./routes/products");
const startScrapingScheduler = require("./utils/scrapeScheduler");
const errorHandler = require("./middleware/errorHandler");
const app = express();

require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// After DB connection
startScrapingScheduler();
app.get("/", (req, res) => {
  res.json({ message: "Product Comparison API" });
});

// Add after middleware setup
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);

app.use(errorHandler);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
