const mongoose = require("mongoose");
const {Schema} = mongoose;


const NewSchema = new Schema({
    image: Object,
    title: String,
    body: String,
    category: String,
    created_at: {type: Date, default: new Date(Date.now())}
})

const News = mongoose.model("News", NewSchema);

module.exports = News;