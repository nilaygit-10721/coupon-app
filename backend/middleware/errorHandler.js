function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes("timeout")) {
    return res.status(504).json({ error: "Request timeout" });
  }

  res.status(500).json({ error: "Something went wrong!" });
}

module.exports = errorHandler;
