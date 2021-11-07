const express = require("express");
const router = express.Router();
const {isAuthenticated} = require("../utils");
const Client = require("../models/Client");


router.get("/", isAuthenticated, async (req, res) => {
    try{
        const clients = await Client.find().sort({created_at: -1}).exec();
        res.render("index", {
            page: "home",
            clients
        });
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})


module.exports = router;