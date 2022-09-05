const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = mongoose.model(
    "Message",
    new Schema({
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      timestamp: { type: Date, required: true },
      content: {type: String, required: true, maxlength: 500},
      location: {type: String, required: true},
    })
  );

module.exports = Message;