const router = require("express").Router();
const Joi = require("joi");
const {Todo} = require("../models/Todo");
const Event = require("../models/Event");
const {daysInMonth, isAuthenticated} = require('../utils');

router.get("/", isAuthenticated, async (req, res) => {
    try{
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const todos = await Todo.find();
        const events = await Event.find();
        const date = new Date();
        const today = date.getDate();
        const firstDay = (new Date(date.getFullYear(), date.getMonth())).getDay();
        const day = days[date.getDay() - 1];
        const monthDays = daysInMonth(date.getMonth(), date.getFullYear());

        res.render("calender/index", {
            page: "calender",
            todos,
            events,
            day,
            today,
            firstDay,
            monthDays,
            date
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const eventSchema = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    title: Joi.string().required(),
    description: Joi.string().allow("", null)
})

router.post("/event/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = eventSchema.validateAsync(data);
        if(isValid.error) return res.redirect(`/calender?error=${isValid.error.message}`);
        const newEvent = await Event.create(data);
        res.redirect(`/calender?addSuccessful=true&name=${newEvent.title}`);
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

router.get("/event/all", isAuthenticated, async (req, res) => {
    try{
        const events = await Event.find();
        res.json(events);
    }
    catch(err){
        console.log(err);
        res.json({error: err.details ? err.details[0].message : err._message});
    }
})

/*
router.get("/event/removeALL", async (req, res) => {
    await Event.deleteMany({});
    const events = await Event.find();
    res.json(events);
})
*/
module.exports = router;