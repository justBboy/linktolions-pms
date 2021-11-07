const router = require("express").Router();
const User = require("../models/User");
const {isAuthenticated} = require('../utils');


router.get('/', isAuthenticated, async (req, res) => {
    try{
        res.render("profile/index.ejs", {
            page: "profile",
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs")
    }
})

module.exports = router;