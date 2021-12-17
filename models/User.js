const mongoose = require("mongoose");
const {Schema} = mongoose;
const { hashPassword, comparePassword } = require("../utils");
const Role = require("./Role");
const {roles} = require("../constants");

const UserSchema = new Schema({
    profile_pic: Object,
    username: String,
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    phone: String,
    role: {type: Schema.Types.ObjectId, ref:"Role"},
    created_at: {type: Date, default: new Date(Date.now())}
})

UserSchema.methods.validatePassword = async function(password){
    return (await comparePassword(password, this.password));
}

UserSchema.pre("save", async function(next){
    if(this.isModified('password')){ 
        const pwordHash = await hashPassword(this.password);
        this.password = pwordHash;
    }
    if(!this.role){
        const employeeRole = await Role.findOne({role: roles.EMPLOYEE});
        this.role = employeeRole._id;
    }
    next();
})

const User = mongoose.model("User", UserSchema);

module.exports = User;