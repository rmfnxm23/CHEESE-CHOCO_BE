const express = require("express");
const router = express.Router();

const shopping_address_Controller = require("../controllers/shopping_address_Controller.js");

const { authenticate } = require("../middlewares/auth");

router.post(
  "/register",
  authenticate,
  shopping_address_Controller.addressRegister
);

router.get("/list", shopping_address_Controller.getAddress);

module.exports = router;
