const mongoose = require("mongoose");

var ChatSchema = new mongoose.Schema({
    room: {
        type: Array
    },
    message: {
        type: String
    }
});
module.exports = mongoose.model("Chat", ChatSchema);