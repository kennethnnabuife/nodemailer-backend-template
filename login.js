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
  try {
    const schema = Joi.object({
      email: Joi.string().min(10).max(500).required().email(),
      password: Joi.string().min(6).max(500).required(),
    });

    //to activate the validation and pass error if it doesn't work
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).send("User not found!");
    }

    // Check if the user's email is verified
    if (!user.isEmailVerified) {
      // Send the verification email
      const token = await jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY
      );

      await sendVerificationEmail(user, token);

      return res
        .status(401)
        .send(
          "Email not verified. Please check your email to verify and login again."
        );
    }

    // Compare the provided password with the stored password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    // Check if the password is valid
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }

    // Generate authentication token
    const token = await jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY
    );

    // Send token to client
    res.send(token);
  } catch (err) {
    console.error(`Server error ${err?.message}`);
    res.status(500).json({ message: `Server error ${err?.message}` });
  }
});

module.exports = router;
