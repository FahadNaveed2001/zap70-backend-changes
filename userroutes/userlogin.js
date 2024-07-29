const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userLogin = async (User, testerUser, predefinedAdmin, req, res) => {
  try {
    const { email, password } = req.body;
    if (email === predefinedAdmin.email && password === predefinedAdmin.password) {
      const token = jwt.sign(
        { email: predefinedAdmin.email, role: "admin" },
        process.env.JWT_SECRET_KEY
      );
      return res.json({ 
        token, 
        role: "Admin",
        success: true, 
        message: "Login successful as admin", 
        userId: null 
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      if (!user.isEmailVerified) {
        return res.status(401).json({
          error: true,
          message: "Email not verified. Please verify your email to login."
        });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ email: user.email, role: "user" }, process.env.JWT_SECRET_KEY);
        return res.status(200).json({
          token,
          role: "User",
          success: true,
          message: "Login successful as user",
          userId: user._id,
        });
      } else {
        user = await testerUser.findOne({ email });
        if (user) {
          if (password === user.password) {
            const token = jwt.sign({ email: user.email, role: "testerUser" }, process.env.JWT_SECRET_KEY);
            return res.status(200).json({

              token,
              role: "Tester",
              success: true,
              message: "Login successful as tester user",
              userId: user._id,
            });
          } else {
            return res.status(401).json({
              error: true,
              message: "The provided Email or Password is invalid."
            });
          }
        }
      }
    }
    return res.status(404).json({
      error: true,
      message: "The provided Email or Password is invalid."
    });
  } catch (error) {
    return res.status(500).json({ error: true, error: error.message, message: "Error Logging In User." });
  }
};

module.exports = { userLogin };
