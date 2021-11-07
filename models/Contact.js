const mongoose = require("mongoose");
const { Schema } = mongoose;


const ContactSchema = new Schema({
    name: String,
    phone: String,
    email: String,
    location: String,
    created_at: {type: Date, default: Date.now}
})

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;