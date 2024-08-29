var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./Posts");
const passport = require("passport");
const upload = require("./multer");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

//! GET home page.
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login", {error: req.flash("error")});
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({username: req.session.passport.user})
    .populate("posts");

  res.render("profile", {user});
});

router.post(
  "/uploadprofileimage",
  isLoggedIn,
  upload.single("profilepic"),
  async function (req, res, next) {
    const user = await userModel.findOne({username: req.session.passport.user});
    user.dp = req.file.filename;
    await user.save();

    res.redirect("/profile");
  }
);

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
router.get("/feed", async function (req, res) {
  const posts = await postModel.find().populate("user");

  res.render("feed", {posts});
});

// ! Create Pin
router.get("/create", async function (req, res) {
  res.render("create");
});

// !Upload Route
router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res) {
    if (!req.file) {
      return res.status(404).send("No files were uploaded.");
    }
    const user = await userModel.findOne({username: req.session.passport.user});
    const post = await postModel.create({
      image: req.file.filename,
      imageText: req.body.filecaption,
      user: user._id,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

// ! LoggedIn Function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
