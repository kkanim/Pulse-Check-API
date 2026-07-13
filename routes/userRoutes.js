const express = require("express");

const auth = require("./../controllers/authController");

const router = express.Router();

router.route("/signup").post(auth.signup);
router.route("/login").post(auth.login);

module.exports = router;
