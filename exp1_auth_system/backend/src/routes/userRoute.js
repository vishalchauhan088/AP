const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const authController = require("../controllers/authController");
router.post("/signUp", authController.signUp);
router.post("/login", authController.login);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("user", "admin"),
    userController.getAllUser
  );

router.route("/:id").delete(userController.deleteUserByUsername);

module.exports = router;
