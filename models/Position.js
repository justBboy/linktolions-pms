const mongoose = require("mongoose");
const {Schema} = mongoose;

const FULL_TIME = 'full-time';
const PART_TIME = 'part-time';
const INTERNSHIP = 'internship';
const FREELANCE = 'freelance';
const REMOTE = 'remote';
const POSITION_TYPES = [FULL_TIME, PART_TIME, INTERNSHIP, FREELANCE, REMOTE];

const APPROVED = '1';
const DECLINED = '2';
const PENDING = '3';
const STATUS_LIST = [APPROVED, DECLINED, PENDING]


const PositionSchema = new Schema({
    title: String,
    type: {type: String, enum: POSITION_TYPES},
    category: String,
    location: String,
    status: {type: String, enum: STATUS_LIST},
    expiry: Date
})

const Position = mongoose.model("Position", PositionSchema);

module.exports = {
    Position,
    STATUS_LIST,
    statusTypes: {
        APPROVED,
        DECLINED,
        PENDING
    },
    positionTypes: {
        FULL_TIME,
        PART_TIME,
        INTERNSHIP,
        FREELANCE,
        REMOTE
    },
    POSITION_TYPES
}