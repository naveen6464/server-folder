const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const config = require("./index");
const User = require("../models/user.model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: config.callbackURL,
      clientID: config.clientID,
      clientSecret: config.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      const { email } = profile._json;
      User.findOne({
        email: profile._json.email,
        isDeleted: false,
        isActive: true,
      }).then((loggedUser) => {
        if (loggedUser) {
          done(null, loggedUser);
        } else {
          let unauthorizedUser = loggedUser;
          unauthorizedUser = {
            error: "not an valid user",
            id: "error",
            email,
          };
          done(null, unauthorizedUser);
        }
      });
    }
  )
);

// http://localhost:3001/v1/auth/google
