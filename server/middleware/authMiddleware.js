const jwt = require("jsonwebtoken");

// Simple auth middleware: validates Bearer token and attaches userId to req
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("[middleware/auth] token verify error:", err.message || err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
