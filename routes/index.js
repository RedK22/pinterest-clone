var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./Posts");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

//! GET home page.
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login", {error: req.flash("error")});
});

router.get("/profile", isLoggedIn, function (req, res, next) {
  res.render("profile");
});

//! Register User - Post Req
router.post("/register", async function (req, res) {
  const {username, email, fullname} = req.body;

  const userData = new userModel({
    username,
    email,
    fullname,
  });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

//! Login User -
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// !Feed
router.get("/feed", function (req, res) {
  res.render("feed");
});

// ! LoggedIn Function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
