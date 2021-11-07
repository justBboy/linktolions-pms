const mongoose = require("mongoose");
const { Schema } = mongoose;


const ApplicantSchema = new Schema({
     position: {
         type: Schema.Types.ObjectId,
         ref: 'Position'
     },
     payment: Number,
     created_at: {type: Number, default: Date.now()}
})

const Applicant = mongoose.model("Applicant", ApplicantSchema);

module.exports = Applicant