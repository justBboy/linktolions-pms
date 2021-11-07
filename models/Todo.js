const mongoose = require("mongoose");
const {Schema} = mongoose;

const HIGH = "high";
const MEDIUM = "med";
const LOW = "low";
const PRIORITYLIST = [HIGH, MEDIUM, LOW];


const TodoSchema = new Schema({
    title: String,
    due: Date,
    priority: {type: String, enum: PRIORITYLIST},
    checked: {type: Boolean, default: false}
})

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = {
    Todo,
    PRIORITYLIST
}
    