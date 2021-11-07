const mongoose = require("mongoose");
const {Schema} = mongoose;
const { hashPassword, comparePassword } = require("../utils");


const UserSchema = new Schema({
    profile_pic: Object,
    username: String,
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true}
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