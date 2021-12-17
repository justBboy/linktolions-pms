const mongoose = require('mongoose');
const {Schema} = mongoose;
const {roleList, roles} = require("../constants");

const RoleSchema = new Schema({
    title: String,
    role: {type: Number, enum: roleList, default: roles.EMPLOYEE},
    permissions: {type: Schema.Types.ObjectId, ref: "permissions"}
})

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;