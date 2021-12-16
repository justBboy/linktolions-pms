const mongoose = require("mongoose");
const {Schema} = mongoose;
const { hashPassword, comparePassword } = require("../utils");
const {roleList, roles} = require("../constants");


const UserSchema = new Schema({
    profile_pic: Object,
    username: String,
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    phone: String,
    role: {type: Number, enum:roleList, default:roles.EMPLOYEE},
    created_at: {type: Date, default: new Date(Date.now())}
})

UserSchema.methods.validatePassword = async function(password){
    return (await comparePassword(password, this.password));
}

UserSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next();
    const pwordHash = await hashPassword(this.password);
    this.password = pwordHash;
    next();
})

const User = mongoose.model("User", UserSchema);

module.exports = User;