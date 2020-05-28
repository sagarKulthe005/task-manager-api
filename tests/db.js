const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../src/models/user");
const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: "Sagar",
  email: "Sagar@sample.com",
  password: "1234567",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const setupDB = async () => {
  await User.deleteMany();
  await new User(userOne).save();
};

module.exports = { userOne, userOneId, setupDB };
