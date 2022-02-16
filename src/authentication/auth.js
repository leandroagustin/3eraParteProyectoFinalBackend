const passport = require("passport");

const express = require("express");
const authWebRouter = express.Router();

const path = require("path");

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

authWebRouter.get("/faillogin", (req, res) => {
  res.render("error al logearse");
});

authWebRouter.get("/logout", (req, res) => {
  const nombre = req.user?.displayName ?? "visitante";
  req.logout();
  res.render(path.join(process.cwd(), "/public/logout.html"), { nombre });
});

module.exports = authWebRouter;
