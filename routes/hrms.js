const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {isAuthenticated} = require("../utils");
const User = require("../models/User");
const Permissions = require("../models/Permissions");
const Role = require("../models/Role");
const {roles} = require("../constants");


router.get("/", isAuthenticated, (req, res) => {
    try{
        res.render("hrms/index", {
            page: "hrms-dashboard"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const perPage = 20;
router.get("/users", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const userRoles = await Role.find()
                                .populate("permissions")
                                .exec();
        const user = await User.findById(req.user._id).populate("role").exec();
        const userPermissions = await Permissions.findById(user.role.permissions);
        const users = await User.find()
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage)
                                .populate("role")
                                .exec();
        const usersLength = await User.count();
        const lastPageNumber = usersLength > perPage ? Math.ceil(usersLength/perPage) : 1;
        console.log(userPermissions);
        res.render("hrms/users", {
            page: "hrms-users",
            users,
            roles,
            userPermissions,
            userRoles,
            pageNumber,
            lastPageNumber
        });
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const userSchema = Joi.object({
    username: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/),
    role: Joi.number().valid(0, 1, 2)
})

const permissionsSchema = Joi.object()

router.post("/updateUserPermissions", isAuthenticated, async(req, res) => {
    const data = req.body;
    try{
        if(req.user.role.role !== roles.SUPERADMIN) throw {details: [{message: "Unauthorized"}]};
        const isValid = await permissionsSchema.validateAsync(data);
        if(isValid.error) return res.redirect(`/hrms/users?error=${isValid.error.message}`);
        for (const permissionId of Object.keys(data)){
            await Permissions.findByIdAndUpdate(permissionId, {
                permissions: {
                    user: {
                        read: data[permissionId].read === 'on',
                        write: data[permissionId].write === 'on',
                        delete: data[permissionId].delete === 'on',
                    }
                }
            })
        }
        res.redirect(`/hrms/users?updateSuccessful=true&name=''`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/hrms/users?error=${error}`);

    }
})

router.post("/users/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    console.log(data);
    try{
        if(!req.user.role.permissions.user.write) throw {details: [{message: "Unauthorized"}]};
        const isValid = await userSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/hrms/users?error=${isValid.error.message}`);

        const newUser = await User.create(data);
        res.redirect(`/hrms/users?addSuccessful=true&name=${newUser.username}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/hrms/users?error=${error}`);
    }
})

router.delete("/users/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        if(!req.user.role.permissions.user.delete) throw {details: [{message: "Unauthorized"}]};
        if(req.user._id !== id)
            await User.deleteOne({_id: id});
        else
            throw "Can't delete your own account"
        res.json({message: "success"})
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.json({error});
    }
})

router.post("/users/update/", isAuthenticated, async (req, res) => {
    const {username, password, email, phone, role} = req.body;
    const data = {username, password, email, phone, role};
    const id = req.body.id;
    try{
        if(!req.user.role.permissions.user.write) throw {details: [{message: "Unauthorized"}]};
        const isValid = await userSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/users?error=${isValid.error.message}`);
        await User.updateOne({_id: id}, data);
        res.json(data);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/users?error=${error}`);
    }    
})

router.get("/departments", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/departments", {
            page: "hrms-departments"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/employee", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/employee", {
            page: "hrms-employee"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/activities", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/activities", {
            page: "hrms-activities"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/holidays", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/holidays", {
            page: "hrms-holidays"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/events", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/events", {
            page: "hrms-events"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/payroll", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/payroll", {
            page: "hrms-payroll"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/accounts", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/report", {
            page: "hrms-report"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/report", isAuthenticated, async (req, res) => {
    try{
        res.render("hrms/report", {
            page: "hrms-report"
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})
module.exports = router;