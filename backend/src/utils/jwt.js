const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

const signToken = (payload, options = {}) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "12h", ...options });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = { signToken, verifyToken };
