import express from "express";
import {
  login,
  register,
  validateToken,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register); // You might want to secure this in production
router.get("/validate", authMiddleware, validateToken);

export default router;
