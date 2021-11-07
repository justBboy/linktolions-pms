const mongoose = require("mongoose");
const { Schema } = mongoose;

const PLANNED = "planned";
const INPROGRESS = "in-progress";
const COMPLETE = "complete";
const INCOMPLETE = "incomplete";

const TaskSchema = new Schema({
    category: {
        type: String,
        enum: [PLANNED, INPROGRESS, COMPLETE, INCOMPLETE],
    },
    title: String,
    description: String,
    date: {type: Date},
    created_at: {type: Date, default: Date.now}
})

const Task = mongoose.model("Task", TaskSchema);

module.exports = {
    Task,
    categoryTypes: {
        PLANNED,
        INPROGRESS,
        COMPLETE,
        INCOMPLETE
    }
}