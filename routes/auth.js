const router = require("express").Router()
const passport = require("passport");
const Joi = require('joi');
const User = require("../models/User");
const multer = require("multer");
const upload = multer({dest: '../static/profile_pics'});
const {isAuthenticated} = require("../utils");

const userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

router.get("/login", (req, res) => {
    const nextUrl = req.query.next;
    res.render("auth/login.ejs", {
        nextUrl
    })
})

router.post("/login", async (req, res, next) => {
    const {rememberMe} = req.body;
    const saveUser = rememberMe === "on";
    const nextUrl = req.query.next;
    console.log(req.query);
    passport.authenticate('local', function(err, user, info){
        if(err) return next(err);
        if(!user) return res.redirect("/auth/login?error=user not found");

        if(saveUser)
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        else
            req.session.cookie.maxAge = false;

        req.login(user, function(err){
            if(err) return next(err);
            return res.redirect(`${nextUrl ? nextUrl : "/"}`);
        })
    })(req, res, next)
})


router.get("/register", (req, res) => {
    res.render("auth/register.ejs")
})

router.post("/register", upload.single('profile_pic'), async (req, res) => {
    const data = req.body;
    try{
        const isValid = await userSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/auth/register?error=${isValid.error.message}`);
        const newUser = new User(data);
        await newUser.save()
        res.redirect("/auth/login");
    }catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.render("404.ejs");
    }
})

router.get("/getuser", isAuthenticated, async (req, res) => {
    try{
        res.json(req.user)
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.json(error);
    }
})

router.get("/logout", isAuthenticated, (req, res) => {
    req.logout();
    res.redirect("/auth/login");
})

router.get("/forgot-password", (req, res) => {
    res.render("auth/forgot-password.ejs")
})

module.exports = router;