const express = require("express");
const chatController = require("../controllers/chatController.js");
const router = express.Router();
const authcontroller = require("../controllers/authController");

router
  .route("/")
  .get(
    authcontroller.protect,
    authcontroller.restrictTo("admin", "user"),
    chatController.getAllChat
  )
  .post(authcontroller.protect, chatController.createOrFindChat);
module.exports = router;
