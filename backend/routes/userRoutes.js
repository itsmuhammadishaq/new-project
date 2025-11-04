const { Router } = require("express");
const {
  registerUser,
  authUser,
  updateUserProfile,
  googleLogin,

  facebookLoginController,
  forgotPassword,
  resetPassword,
} = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMidlewares");
const passport = require("passport");

const router = Router();

router.route("/").post(registerUser);
router.route("/login").post(authUser);
router.route("/profile").post(protect, updateUserProfile);
router.route("/google-login").post(googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.post(
  "/facebook-login",
  (req, res, next) => {
    if (req.body.accessToken && !req.body.access_token) {
      req.body.access_token = req.body.accessToken;
    }
    next();
  },
  passport.authenticate("facebook-token", { session: false }),
  facebookLoginController
);

module.exports = router;
