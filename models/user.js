const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = mongoose.model(
    "User",
    new Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
      admin: {type: String, required: true},
      member: {type: String, required: true},
      location: {type: String}
    })
  );

module.exports = User;