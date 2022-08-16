const ChatController = require("./chat.controller");
module.exports = function (app){
    app.use("/chat", ChatController)
    return app;
}