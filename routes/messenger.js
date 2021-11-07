const router = require("express").Router();
const {isAuthenticated} = require("../utils");


const onlineUsers = new Map();

router.get("/", isAuthenticated, (req, res) => {
    res.render("messenger/index", {
        page: "index"
    })
})

function initializeSocket(io){
    /* io.on("connection", (socket) => {
        console.log("connecting");
        socket.emit("hello");

        socket.on("disconnect", () => {
            console.log("disconnecting")
        })
    }) */
}

module.exports = {router, initializeSocket};