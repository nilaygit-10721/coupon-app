import express from "express";
import {
  claimCoupon,
  getCoupons,
  addCoupon,
  updateCoupon,
  getClaimHistory,
} from "../controllers/couponController.js";
import checkAbuse from "../middleware/checkAbuse.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/claim", checkAbuse, claimCoupon);
router.post("/claim", checkAbuse, claimCoupon);
router.get("/all", getCoupons);

// Protected admin routes
router.post("/add", authMiddleware, addCoupon);
router.patch("/:id", authMiddleware, updateCoupon);
router.get("/history", authMiddleware, getClaimHistory);

export default router;
