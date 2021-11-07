const mongoose = require("mongoose");
const { Schema } = mongoose;


const LOWER = "lower";
const HIGH = "high";
const MEDIUM = "medium";
const PRIORITYLIST = [LOWER, HIGH, MEDIUM];

const PRE_SALES = "pre-sales";
const PAYMENT = "payment";
const SALES = "sales";
const TECHNICAL = "technical ";
const DEPARTMENTS = [PRE_SALES, PAYMENT, SALES, TECHNICAL];

const TicketSchema = new Schema({
    id: String,
    title: String,
    priority: {type: String, enum: PRIORITYLIST},
    department: {type: String, enum: DEPARTMENTS},
    agent: String,
    date: Date,
})

const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = {
    Ticket,
    PRIORITYLIST,
    DEPARTMENTS
}