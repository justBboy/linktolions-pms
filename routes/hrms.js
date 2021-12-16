const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {isAuthenticated} = require("../utils");
const User = require("../models/User");
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
        const users = await User.find()
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage);

        const usersLength = await User.count();
        const lastPageNumber = usersLength > perPage ? Math.ceil(usersLength/perPage) : 1;
        res.render("hrms/users", {
            page: "hrms-users",
            users,
            roles,
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

router.post("/users/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await userSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/users?error=${isValid.error.message}`);

        const newUser = await User.create(data);
        res.redirect(`/users?addSuccessful=true&name=${newUser.username}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0]._message : err._message;
        res.redirect(`/users?error=${error}`);
    }
})

router.delete("/users/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        await User.deleteOne({_id: id});
        res.json({message: "success"})
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message});
    }
})

router.post("/users/update/", isAuthenticated, async (req, res) => {
    const {username, password, email, phone, role} = req.body;
    const data = {username, password, email, phone, role};
    const id = req.body.id;
    try{
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