const router = require("express").Router()
const {Position, POSITION_TYPES, positionTypes, statusTypes, STATUS_LIST} = require("../models/Position");
const Resume = require("../models/Resume");
const Applicant = require("../models/Applicant");
const {isAuthenticated} = require('../utils');
const Joi = require("joi");

router.get("/", isAuthenticated, async (req, res) => {
    try{
        res.render("jobportal/index", {
            page: "jobportal",
        });
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const positionSchema = Joi.object({
    title: Joi.string().required(),
    type: Joi.string().required(),
    category: Joi.string().required(),
    location: Joi.string().allow("", null),
    status: Joi.string().allow("", null),
    expiry: Joi.date().required()
})

const perPage = 10;
router.get("/positions", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const positions = await Position.find()
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage)
        const positionsLength = await Position.count();
        const lastPageNumber = positionsLength > perPage ? Math.ceil(positionsLength/perPage) : 1;
        res.render("jobportal/positions.ejs", {
            page: "positions",
            positions,
            statusTypes,
            POSITION_TYPES,
            STATUS_LIST,
            positionTypes,
            lastPageNumber,
            pageNumber
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }

})

router.post("/positions/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await positionSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/positions/error=${isValid.error.message}`);
        const newPosition = await Position.create(data);
        res.redirect(`/jobportal/positions?addSuccessful=true&name=${newPosition.title}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].mesasge : err._message;
        res.redirect(`/jobportal/positions?error=${error}`);
    }
})

router.post("/positions/addjson", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await positionSchema.validateAsync(data);
        console.log(isValid);
        if (isValid.error) return res.json({error: isValid.error.message});
        const newPosition = await Position.create(data);
        console.log(newPosition);
        res.json({newPosition});
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.json({error})
    }
})

router.post("/positions/update/:id", isAuthenticated, async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    console.log(data);
    try{
        const isValid = await positionSchema.validateAsync(data);
        if (isValid.error) return res.json({error: isValid.error.message});
        await Position.updateOne({_id: id}, data);
        res.json(data);
    }
    catch(err){
        console.log(err);
        if(err.details){
            res.json({error: err.details[0].message})
        }
        else{
            res.json({error: err._message});
        }
    }    
})

router.post("/positions/search", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    const {type, category, search} = req.body;
    try{
        const positions = await Position.find({type, category})
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage)
        const positionsLength = await Position.count();
        const lastPageNumber = positionsLength > perPage ? Math.ceil(positionsLength/perPage) : 1;
        res.render("jobportal/positions.ejs", {
            page: "positions",
            positions,
            statusTypes,
            POSITION_TYPES,
            STATUS_LIST,
            positionTypes,
            lastPageNumber,
            pageNumber
        })
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.render("")
    }
})

router.delete("/positions/:id", isAuthenticated, async (req, res) => {
    try{
        const id = req.params.id;
        console.log(id);
        await Position.deleteOne({_id: id});
        res.json({message: "success"});
    }
    catch(err){
        res.json({error: err})
    }
})

router.delete("/positions/deleteAll", isAuthenticated, async (req, res) => {
    await Position.deleteMany({});
    res.send("success");
})

router.get("/applicants", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const applicants = await Applicant.find()
                                .populate()
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage)
        const applicantsLength = await Position.count();
        const lastPageNumber = applicantsLength > perPage ? Math.ceil(applicantsLength/perPage) : 1;
        res.render("jobportal/applicants.ejs", {
            page: "applicants",
            applicants,
            lastPageNumber,
            statusTypes,
            POSITION_TYPES,
            STATUS_LIST,
            positionTypes,
            lastPageNumber,
            pageNumber
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }

})

const applicantSchema = Joi.object({
    position: Joi.string().required(),
    payment: Joi.number().required()
})

router.post("/positions/addjson", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await applicantSchema.validateAsync(data);
        console.log(isValid);
        if (isValid.error) return res.json({error: isValid.error.message});
        const newApplicant = await Applicant.create(data);
        res.json({...newApplicant});
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.json({error})
    }
})

router.post("/positions/update/:id", isAuthenticated, async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    console.log(data);
    try{
        const isValid = await applicantSchema.validateAsync(data);
        if (isValid.error) return res.json({error: isValid.error.message});
        await Applicant.updateOne({_id: id}, data);
        res.json(data);
    }
    catch(err){
        console.log(err);
        if(err.details){
            res.json({error: err.details[0].message})
        }
        else{
            res.json({error: err._message});
        }
    }    
})

router.post("/applicants/search", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    const {type, category, search} = req.body;
    try{
        const applicants = await Applicant.find({type, category})
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage)
        const applicantLength = await Applicant.count();
        const lastPageNumber = applicantLength > perPage ? Math.ceil(applicantLength/perPage) : 1;
        res.render("jobportal/positions.ejs", {
            page: "positions",
            applicants,
            statusTypes,
            POSITION_TYPES,
            STATUS_LIST,
            positionTypes,
            lastPageNumber,
            pageNumber
        })
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.render("404.ejs");
    }
})

router.delete("/positions/:id", isAuthenticated, async (req, res) => {
    try{
        const id = req.params.id;
        console.log(id);
        await Position.deleteOne({_id: id});
        res.json({message: "success"});
    }
    catch(err){
        res.json({error: err})
    }
})

router.get("/resumes", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const resumes = await Resume.find()
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage)
        const resumesLength = await Resume.count();
        const lastPageNumber = resumesLength > perPage ? Math.ceil(resumesLength/perPage) : 1;
        res.render("jobportal/resumes.ejs", {
            page: "resumes",
            resumes,
            resumesLength,
            lastPageNumber,
            pageNumber
        })
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.render("404.ejs");
    }
})

const resumeSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    skills: Joi.array().required(),
    payment: Joi.number().required(),
    location: Joi.string().required()
})

router.post("/resumes/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await resumeSchema.validateAsync(data);

        if(isValid.error) {
            return res.json({error: isValid.error.message})
        }

        const newTask = await Resume.create(data);
        res.json(newTask);
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message});
    }
})
module.exports = router;