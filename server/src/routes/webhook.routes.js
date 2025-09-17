const express = require("express");
const { clerkWebhook } = require("../controllers/webhook.controller");

const router = express.Router();

router.post("/clerk", clerkWebhook);

module.exports = router;
