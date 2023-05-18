const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// To import other components
const { User } = require("../models/user");
const { sendVerificationEmail } = require("../utils/email");

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  // Validate user input
  try {
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().min(10).max(500).email().required(),
      phoneNumber: Joi.string().min(6).max(20).required(),
      password: Joi.string().min(6).max(1024).required(),
    });

    // Validate request body against the schema
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send("User already registered. Proceed to login");
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user with the request body
    user = new User({
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: hashedPassword,
      isEmailVerified: false, // Add a flag for email verification
    });

    // Save the new user to the database
    user = await user.save();

    // Generate authentication token
    const token = await jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY
    );

    // Send confirmation email
    await sendVerificationEmail(user, token);

    // Send a response to the user
    res.send("Please check your email for the confirmation link.");
  } catch (err) {
    console.error(`Server error ${err?.message}`);
    res.status(500).json({ message: `Server error ${err?.message}` });
  }
});

module.exports = router;
