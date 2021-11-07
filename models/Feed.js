const mongoose = require("mongoose");
const {Schema} = mongoose;


const FeedSchema = new Schema({
    image: Object,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    body: String,
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        comment: String
    }],
    likes: Number,
    created_at: {type: Date, default: new Date(Date.now())}
})

const Feed = mongoose.model("Feed", FeedSchema);

module.exports = Feed;