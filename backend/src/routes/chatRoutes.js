const express = require("express"); 


const { startChat } = require("../controllers/chatController");

const router = express.Router();

router.get("/start", startChat);

module.exports = router;    