const { Router } = require("express");
const { registerUser, authUser, updateUserProfile } = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMidlewares");

const router = Router();

router.route("/").post(registerUser);
router.route("/login").post(authUser);
router.route("/profile").post(protect,updateUserProfile);

module.exports = router;
