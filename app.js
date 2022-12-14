const moment = require('moment');
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const http = require('http').createServer(app);
const bodyParser = require("body-parser");
require("dotenv/config");

const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false, log: true }});
manager.load();

app.use(bodyParser.urlencoded({
    extended: true
}));

// require("./model");
// require("./controller")(app);

const io = require('socket.io')(http,{
    cors:true,
    origins:["http://localhost/"],
   }
)

let users = [];

io.on('connection', socket => {
    socket.on("user-connected", name => {
        let user = {
            id: socket.id,
            name: name,
            availableFrom: moment().format("hh:mm A")
        }
        users.push(user);
        let usersId = users.map((obj) => {
            return obj.id;
        })
        
        let ibot = {
            id: 'ibotYftM56DjvmsxDReB',
            name: 'iBot',
            availableFrom: moment().format("hh:mm A")
        }
        if(!usersId.includes(ibot.id)){
            users.push(ibot);
        }
        io.emit("user-connected", users);
    })
    socket.on("disconnect", () => {
        users = users.filter(user => user.id != socket.id);
        io.emit("user-disconnected", users);
    })
    socket.on("create-room", (data) =>{
        socket.join(data.room);
        let receiver = users.filter(user => user.name == data.receiver)
        socket.broadcast.to(receiver[0].id).emit("invite", data.room)
    })
    socket.on("join-room", room => {
        socket.join(room);
    })
    socket.on("chat-message", data => {
        io.to(data.room).emit("message", formatMessage(data.sender, data.message, data.room));

        let room = Buffer.from(data.room, 'base64').toString();
        if(room.includes("iBot")){
            chatbot(data.message).then(result => {
                if(result == null){
                    setTimeout(() => {
                        io.to(data.room).emit("message", formatMessage("iBot", "Sorry Contact to Support team...", data.room));
                    }, 1000);
                  }
                  else{
                    setTimeout(() => {
                        io.to(data.room).emit("message", formatMessage("iBot", result, data.room));
                    }, 1000);
                  }
            })
        }
    })
})

async function chatbot(msg){
    let response = await manager.process("en", msg);
    return response.answer;
}

function formatMessage(user, message, room) {
    return {
        room,
        user,
        message,
        datetime: moment().format('h:mm a')
    };
}

let port = process.env.PORT || 8000;
http.listen(port, () => {
    console.log(`Server started at: ${port}`);
});