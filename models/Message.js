const mongoose = require("mongoose");
const {Schema} = mongoose;


const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: String,
    created_at: {
        type: Date,
        default: new Date(Date.now())
    }
})

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;