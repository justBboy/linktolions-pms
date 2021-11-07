const router = require("express").Router();
const News = require('../models/News');
const {isAuthenticated} = require("../utils");
const multer = require("multer");
const Joi = require('joi');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "news",
    }
})
const upload = multer({storage});

const perPage = 20;

router.get("/", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
    const news_array = await News.find({})
                                  .skip((perPage * pageNumber) - perPage)
                                  .limit(perPage);
    const newsLength = await News.count();
    const lastPageNumber = newsLength > perPage ? Math.ceil(newsLength/perPage) : 1;
        res.render("news/index.ejs", {
            page: "news",
            news_array,
            pageNumber,
            lastPageNumber
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const newSchema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    category: Joi.string().required(),
})

router.post('/add', isAuthenticated, upload.single('image'), async (req, res) => {
    const data = req.body;
    const image = req.file;
    try{
        const isValid = await newSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/news?error=${isValid.error.message}`);
        if(!image) throw "image is required";
        const news = await News.create({...data, image});
        res.redirect(`/news?addSuccessful=true&name=${news.title}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/news?error=${error}`);
    }
})

router.delete("/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        await News.deleteOne({_id: id});
        res.json({message: "success"})
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message});
    }
})

router.post("/update/:id", isAuthenticated, async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    try{
        const isValid = await newSchema.validateAsync(data);
        if (isValid.error) return res.json({error: isValid.error.message});
        await News.updateOne({_id: id}, data);
        res.redirect(`/news?updateSuccessful=true&name=${data.title}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/news?error=${error}`)
    }    
})

module.exports = router;