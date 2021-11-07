const router = require("express").Router();
const {isAuthenticated} = require("../utils");
const Joi = require("joi");
const Feed = require("../models/Feed");

const perPage = 5;
router.get("/", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const feeds = await Feed.find({})
                                .skip((perPage * pageNumber) - perPage)
                                .limit(perPage);
        const feedsLength = await Feed.count();
        const lastPageNumber = feedsLength > perPage ? Math.ceil(feedsLength/perPage) : 1;
        res.render("social/index.ejs", {
            page: "social",
            feeds,
            pageNumber,
            lastPageNumber
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const feedSchema = Joi.object({
    body: Joi.string().required(),
})

router.post("/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    const image = req.file;
    try{
        const isValid = await feedSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/social?error=${isValid.error.message}`);
        await Feed.create({...data, image});
        res.redirect("/social?addSuccessful=true&name=new feed")
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/social?error=${error}`);
    }
})

router.post("/update/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try{
        const isValid = await feedSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/social?error=${isValid.error.message}`);
        await Feed.updateOne({_id: id}, data);
        res.redirect("/social?updateSuccessful=true&name=feed");
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/social?error=${error}`)
    }
})

router.delete("/:id", isAuthenticated, async (req, res) => {
    try{
        await Feed.deleteOne({_id: req.params.id});
        res.redirect("/social?deleteSuccessful=true");
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/social?error=${error}`)
    }
})

module.exports = router;