const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Store user data in request
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
}


// authMiddleware.js
function ensureRole(role) {
    return (req, res, next) => {
      if (req.session.user && req.session.user.role === role) {
        return next();
      }
      return res.status(403).send('Access denied. Unauthorized role.');
    };
  }
  
  module.exports = { ensureRole };
  
module.exports = authenticateToken;
