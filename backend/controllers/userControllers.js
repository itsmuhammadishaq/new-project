const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/usermodel");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail"); // ✅ added import
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER USER
const registerUser = asyncHandler(async (req, resp) => {
  const { name, email, password, pic } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    resp.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, pic });
  if (user) {
    resp.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    resp.status(400);
    throw new Error("Error occurred!");
  }
});

// LOGIN USER
const authUser = asyncHandler(async (req, resp) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    resp.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    resp.status(400);
    throw new Error("Invalid Email or password!");
  }
});

// UPDATE PROFILE
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.pic = req.body.pic || user.pic;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

// GOOGLE LOGIN
const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, picture } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: Math.random().toString(36).slice(-8),
      pic: picture,
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// FACEBOOK LOGIN
const facebookLoginController = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Facebook authentication failed");
  }

  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User with this email not found." });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set fields
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  // Build reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - NoteZipper",
      html: message,
    });

    res.json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error("Email send failed:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(500).json({ message: "Server error", error: "Email could not be sent" });
  }
});

// RESET PASSWORD
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful! You can now login with your new password." });
});

module.exports = {
  registerUser,
  authUser,
  updateUserProfile,
  googleLogin,
  facebookLoginController,
  forgotPassword,
  resetPassword,
};
