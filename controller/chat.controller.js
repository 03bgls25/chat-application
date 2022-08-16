const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const router = express.Router();
const ChatModel = mongoose.model("Chat");


module.exports = router;