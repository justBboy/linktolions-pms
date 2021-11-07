const mongoose = require("mongoose");
const {Schema} = mongoose;


const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receipient: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    message: String
})

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;