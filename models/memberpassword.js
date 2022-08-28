const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Password = mongoose.model(
    "Password",
    new Schema({
      password: { type: String, required: true },
    })
  );

module.exports = Password;