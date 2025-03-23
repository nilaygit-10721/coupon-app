import Coupon from "../models/coupon.js";

// Claim a coupon (public)
// Claim a coupon (public)
export const claimCoupon = async (req, res) => {
  try {
    // For GET requests (list available coupons)
    if (req.method === "GET") {
      const availableCoupons = await Coupon.find({
        isActive: true,
        claimedBy: { $exists: false },
      });

      return res.status(200).json(availableCoupons);
    }

    // For POST requests (claim a specific coupon)
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({ message: "Coupon ID is required." });
    }

    // Find the specific coupon
    const coupon = await Coupon.findOne({
      _id: couponId,
      isActive: true,
      claimedBy: { $exists: false },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon is not available." });
    }

    // Update the coupon with claim information
    coupon.claimedBy = {
      ip: req.clientIp,
      sessionId: req.sessionId,
      timestamp: new Date(),
    };

    await coupon.save();

    res.status(200).json({
      message: "Coupon claimed successfully!",
      coupon: {
        code: coupon.code,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
};
// Get all coupons (admin only)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

// Add a new coupon (admin only)
export const addCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required." });
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }

    const newCoupon = new Coupon({
      code,
      isActive: true,
    });

    await newCoupon.save();

    res.status(201).json({
      message: "Coupon added successfully.",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

// Update a coupon (admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: "No update data provided." });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    coupon.isActive = isActive;
    await coupon.save();

    res.status(200).json({
      message: "Coupon updated successfully.",
      coupon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

// Get claim history (admin only)
export const getClaimHistory = async (req, res) => {
  try {
    const history = await Coupon.find({
      claimedBy: { $exists: true, $ne: null },
    }).sort({ "claimedBy.timestamp": -1 });

    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
};
