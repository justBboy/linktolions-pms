const mongoose = require("mongoose");
const {Schema} = mongoose;


const BlogSchema = new Schema({
    title: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    image: Object,
    body: String,
    hearts: Number,
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        comment: String
    }]
})


const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;