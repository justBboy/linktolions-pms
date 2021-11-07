const mongoose = require("mongoose");
const {Schema} = mongoose;

const OPEN = "open";
const ISSUELEVEL1 = "issue-level-1";
const ISSUELEVEL2 = "issue-level-2";

const STATUSLIST = [OPEN, ISSUELEVEL1, ISSUELEVEL2];

const NONE = "none";
const HIGH = "high";
const MEDIUM = "medium";
const PRIORITYLIST = [NONE, HIGH, MEDIUM];


const ProjectSchema = new Schema({
    owner: String,
    milestone: String,
    status: {type: String, enum: STATUSLIST},
    work: Number,
    duration: Number,
    priority: {type: String, enum: PRIORITYLIST},
    progress: {type: Number, default: 0}
})

const Project = mongoose.model("Project", ProjectSchema);

module.exports = {
    statusTypes:{
        OPEN,
        ISSUELEVEL1,
        ISSUELEVEL2
    },
    priorityTypes: {
        NONE,
        HIGH,
        MEDIUM
    },
    PRIORITYLIST,
    STATUSLIST,
    Project
}