import Coupon from "../models/coupon.js";

const checkAbuse = async (req, res, next) => {
  try {
    // Get IP and session ID
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const sessionId = req.cookies.sessionId || req.headers["session-id"];

    // Store for later use in controller
    req.clientIp = clientIp;
    req.sessionId = sessionId;

    // Check if IP has already claimed a coupon recently
    const recentIpClaim = await Coupon.findOne({
      "claimedBy.ip": clientIp,
      "claimedBy.timestamp": {
        $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }, // Within 24 hours
    });

    if (recentIpClaim) {
      return res.status(429).json({
        message:
          "You've already claimed a coupon recently. Please try again later.",
      });
    }

    // Check if session has already claimed a coupon
    if (sessionId) {
      const sessionClaim = await Coupon.findOne({
        "claimedBy.sessionId": sessionId,
      });

      if (sessionClaim) {
        return res.status(429).json({
          message:
            "You've already claimed a coupon from this browser. Please try from a different device.",
        });
      }
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

export default checkAbuse;
