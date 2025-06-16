// routes/orderItem.js (또는 routes/tempOrder.js)
const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");

const { authenticate } = require("../middlewares/auth");

router.post("/save", authenticate, orderItemController.saveItem);

module.exports = router;
