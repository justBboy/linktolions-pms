const mongoose = require("mongoose");
const {Schema} = mongoose;


const MailSchema = new Schema({
    to: String,
    subject: String,
    html: String,
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    drafted: {type: Boolean, default: false},
    trashed: {type: Boolean, default: false},
    created_at: {
        type: Date,
        default: new Date(Date.now())
    }
})


const Mail = mongoose.model("Mail", MailSchema);

module.exports = Mail;