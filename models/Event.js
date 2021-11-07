const mongoose = require("mongoose");
const {Schema} = mongoose;


const EventSchema = new Schema({
    startDate: Date,
    endDate: Date,
    title: String,
    description: String
})

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;