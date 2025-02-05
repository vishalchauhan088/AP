const mongoose = require("mongoose");

const chatMemberSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatMember = mongoose.model("ChatMember", chatMemberSchema);

module.exports = ChatMember;
