import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    claimedBy: {
      ip: String,
      sessionId: String,
      timestamp: Date,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
