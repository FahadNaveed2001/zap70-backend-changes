const jwt = require("jsonwebtoken");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  // console.log(req.headers);
  const token = req.header("Authorization");
  if (!token) {
    return res.status(403).sendFile(path.join(__dirname, "public", "accessDenied.html"));
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).sendFile(path.join(__dirname, "public", "accessDenied.html"));
  }
};

const routesWithoutToken = [
  "/forgot-password",
  "/user-login",
  "/verify-email",
  "/user-signup",
  "/reset-password/:id/:token",
  "/attempted-questions",
  "/uploads/",
  '/add-tester-user',
];

module.exports = { verifyToken, routesWithoutToken };
