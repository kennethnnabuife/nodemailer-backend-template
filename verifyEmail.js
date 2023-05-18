const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// To import other components
const { User } = require("../models/user");

router.get("/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user in the database by email
    const user = await User.findOne({ email: decoded.email });

    // Check if the user exists
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the user's email is already verified
    if (user.isEmailVerified) {
      return res.status(400).send("Email already verified. Proceed to login");
    }

    // Mark the user's email as verified
    user.isEmailVerified = true;
    await user.save();

    // Send a response indicating successful email verification
    res.send("Email verification successful. Proceed to login");
  } catch (err) {
    console.error(`Server error ${err?.message}`);
    res.status(500).json({ message: `Server error ${err?.message}` });
  }
});

module.exports = router;
