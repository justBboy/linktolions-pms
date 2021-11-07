const express = require("express");
const router = express.Router()
const {isAuthenticated} = require('../utils');


router.get("/", isAuthenticated, (req, res) => {
    res.render("email/index", {
        page: "email"
    })
})

router.get("/compose", isAuthenticated, (req, res) => {
    res.render("email/compose", {
        page: "email"
    })
})

module.exports = router;