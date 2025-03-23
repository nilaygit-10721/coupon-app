import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    console.log("Auth header:", authHeader); // Check if header is present

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization denied, token missing." });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token.substring(0, 10) + "..."); // Show first few chars

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully, admin ID:", decoded.id);

      // Check if admin exists
      const admin = await Admin.findById(decoded.id);

      if (!admin) {
        console.log("Admin not found in database with ID:", decoded.id);
        return res
          .status(401)
          .json({ message: "Authorization denied, admin not found." });
      }

      console.log("Admin found:", admin.email || admin.username);
      req.admin = decoded;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.name, jwtError.message);
      return res.status(401).json({
        message: "Token validation failed",
        error: jwtError.name,
      });
    }
  } catch (error) {
    console.error("General auth middleware error:", error);
    return res.status(401).json({ message: "Authentication error." });
  }
};
