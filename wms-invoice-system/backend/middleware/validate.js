const jwt = require("jsonwebtoken");

const JWT_SECRET = "cwms_secret_key_2026";

function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {

    return res.status(401).json({
      success: false,
      message: "Token required"
    });

  }

  const token = authHeader.replace("Bearer ", "");

  try {

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });

  }

}

module.exports = authMiddleware;