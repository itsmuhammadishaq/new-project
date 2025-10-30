const asyncHandler = require("express-async-handler");
const User = require("../models/usermodel");
const generateToken = require("../utils/generateToken");

const registerUser = asyncHandler(async (req, resp) => {
  const { name, email, password, pic } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    resp.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  console.log(user, "USER");

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

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.pic = req.body.pic || user.pic;
    if (req.body.password) {
      user.password = req.body.password;
    }

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

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const facebookLoginController = asyncHandler(async (req, res) => {
  console.log("inside controller", req);
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

module.exports = {
  registerUser,
  authUser,
  updateUserProfile,
  googleLogin,
  facebookLoginController,
};
