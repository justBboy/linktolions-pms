const mongoose = require("mongoose");
const {Schema} = mongoose;


const ResumeSchema = new Schema({
    name: String,
    email: String,
    skills: [{
        type: String
    }],
    payment: Number,
    location: String
})


const Resume = mongoose.model("Resume", ResumeSchema);

module.exports = Resume;