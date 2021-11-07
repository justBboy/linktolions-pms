const mongoose = require("mongoose")
const { Schema} = mongoose;


const ClientSchema = new Schema({
    name: String,
    email: String,
    tag: String,
    facebook: String,
    slack: String,
    linkedin: String,
    skype: String,
    projectsCount: {type: Number, default: 0},
    profit: {type: Number, default: 0},
    created_at: {type: Number, default: Date.now()}
})

const Client = mongoose.model("Client", ClientSchema);

module.exports = Client;