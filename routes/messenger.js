const router = require("express").Router();
const User = require("../models/User");
const Message = require("../models/Message");
const Joi = require("joi");
const {isAuthenticated} = require("../utils");


const onlineUsers = new Map();

router.get("/", isAuthenticated, (req, res) => {
    res.render("messenger/index", {
        page: "index"
    })
})
const perPage = 5;
router.get("/chats", isAuthenticated, async (req, res) => {
    const user = req.query.user;
    const target = req.query.target;
    const lastMessageDate = req.query.lastMessageDate;
    const pageNumber = req.query.page || 1;
    console.log(lastMessageDate);
    try{
        let messages;
        if(!lastMessageDate){
            messages = await Message.find({
                                $or: [
                                        {sender: user, receipient: target}, 
                                        {sender: target, receipient: user}, 
                                ],
                            })
                            .sort("-created_at")
                            .skip((perPage * pageNumber) - perPage)
                            .limit(perPage)
                            .populate("sender")
                            .populate("receipient")
                            .exec();
            messages = messages.reverse();
        }
        else{
            /* const filters = {
                created_at: {
                        $gte: lastMessageDate
                    }
            } */
            messages = await Message.find({
                                $or: [
                                        {sender: user, receipient: target}, 
                                        {sender: target, receipient: user}, 
                                ],
                                created_at: {
                                    $gte: lastMessageDate
                                }
                            })
                            .populate("sender")
                            .populate("receipient")
                            .exec();
            console.log(lastMessageDate)
            console.log(messages)
        }
        res.json(messages);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].error : err._message;
        res.json(error);
    }
})

const messageSchema = Joi.object({
    sender: Joi.string().required(),
    receipient: Joi.string().required(),
    message: Joi.string().required()
})

function initializeSocket(io){
    io.on("connection", async (socket) => {
        console.log("connecting");
        let users = await User.find({}).select("-password");
        
        users = users.filter(u => u._id != socket.userid)
                .map(user => ({
                    user: user,
                    online: !!onlineUsers[user._id],
                    socketID: onlineUsers[user._id] ? onlineUsers[user._id].socketID : null
                }))

        for (let [id, socket] of io.of("/").sockets){
            onlineUsers[socket.userid] = {
                socketID: id,
                uid: socket.userid
            }
        } 

        socket.emit("get users", users);
        socket.broadcast.emit("user connected", {
            socketID: socket.id,
            uid: socket.userid,
            online: true
        });

        socket.on("private message", async ({targetUser, fromUid, content}) => {
            const newMessage = {
                receipient: targetUser.uid,
                sender: fromUid,
                message: content
            }
            const isValid = await messageSchema.validateAsync(newMessage);
            if(isValid.error) throw new Error("Message not sent");
            await Message.create(newMessage);
            socket.to(targetUser.socketID).emit('private message', {
                content,
                fromUid
            })
        })

        socket.emit("hello");

        socket.on("disconnect", () => {
            socket.broadcast.emit("user disconnected", {
                socketID: socket.id,
                uid: socket.userid,
                online: false
            })
            onlineUsers.delete(socket.userid);
        })
    })
}

module.exports = {router, initializeSocket};