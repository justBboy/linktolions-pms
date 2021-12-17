const mongoose = require("mongoose");
const {Schema} = mongoose;


const PermissionsSchema = new Schema({
    role: {type: Schema.Types.ObjectId, ref:"User"},
    permissions: {
        user: {
            read: Boolean,
            write: Boolean,
            delete: Boolean 
        }
    }
})

const Permissions = mongoose.model("permissions", PermissionsSchema);

module.exports = Permissions;