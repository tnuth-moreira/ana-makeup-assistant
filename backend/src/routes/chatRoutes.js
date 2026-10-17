const express = require("express");

const {
  startChat,
  sendMessage,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/start", startChat);

router.post("/message", sendMessage);

module.exports = router;