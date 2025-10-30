const passport = require("passport");
const FacebookTokenStrategy = require("passport-facebook-token");
const User = require("../models/usermodel");
const generateToken = require("../utils/generateToken");

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.REACT_APP_FACEBOOK_APP_ID||"869665285388779",
      clientSecret: process.env.FACEBOOK_APP_SECRET||"8a5f615e7eb3b2aa721a92426038193f",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            pic:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            password: Math.random().toString(36).slice(-8),
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
