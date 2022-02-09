const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

const authWebRouter = require("express").Router();

const path = require("path");

const FACEBOOK_CLIENT_ID = "3146994242213072";
const FACEBOOK_CLIENT_SECRET = "bdf4c79fa275e26904d165b248cde4f7";

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "emails"],
      scope: ["email"],
    },
    function (accessToken, refreshToken, profile, done) {
      let userProfile = profile;
      return done(null, userProfile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

authWebRouter.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(process.cwd(), "/public/login.html"));
  }
});

authWebRouter.get("/auth/facebook", passport.authenticate("facebook"));
authWebRouter.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/faillogin",
  })
);

authWebRouter.get("/faillogin", (req, res) => {
  res.render("error al logearse");
});

authWebRouter.get("/logout", (req, res) => {
  const nombre = req.user?.displayName ?? "visitante";
  req.logout();
  res.render(path.join(process.cwd(), "/public/logout.html"), { nombre });
});

module.exports = authWebRouter;
