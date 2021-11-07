const express = require('express');
const router = express.Router()
const Contact = require("../models/Contact");
const Joi = require("joi");
const {isAuthenticated} = require('../utils');

const schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    location: Joi.string().required()
})

const perPage = 10;
router.get("/", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const contacts = await Contact.find()
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage);

        const contactsLength = await Contact.count();
        const lastPageNumber = contactsLength > perPage ? Math.ceil(contactsLength/perPage) : 1;
        res.render("contact/index", {
            page: "contact",
            contacts,
            pageNumber,
            lastPageNumber
        });
    }
    catch(err){
        res.render("404.ejs");
    }
})

router.post("/addDummy", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await schema.validateAsync(data);

        if (isValid.error) {
            return res.json({error: isValid.error.message})
        }

        for(let i = 0; i<50; i++){
            const newContact = await Contact.create(data);
        }
        res.json(data);
    }
    catch(err){
        res.json({error: err})
    }
})

router.post("/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await schema.validateAsync(data);

        if (isValid.error) {
            return res.json({error: isValid.error.message})
        }

        const newContact = await Contact.create(data);
        res.json(newContact);
    }
    catch(err){
        res.json({error: err})
    }
})

router.delete("/:id", isAuthenticated, async (req, res) => {
    try{
        const id = req.params.id;
        await Contact.deleteOne({_id: id});
        res.json({message: "success"});
    }
    catch(err){
        res.json({error: err})
    }
})

router.post("/update", isAuthenticated, async (req, res) => {
    const data = req.body;
    const name = data.name;
    const email = data.email;
    const phone = data.phone;
    const location = data.location;
    console.log("update")
    try{
        const isValid = await schema.validateAsync({name, email, phone, location});

        if (isValid.error) {
            return res.json({error: isValid.error.message})
        }
        await Contact.updateOne({_id: data.id}, {name, email, phone, location});
        res.json(data);
    }
    catch(err){
        console.log(err);
        res.json({error: err})
    }
})

module.exports = router;