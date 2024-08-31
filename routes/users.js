const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
require("dotenv").config(); // Load .env file

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB Atlas");
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  dp: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
