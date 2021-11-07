const router = require("express").Router();
const Blog = require("../models/Blog");
const Joi = require("joi");
const {isAuthenticated} = require("../utils");

const perPage = 5;

router.get("/", isAuthenticated, async (req, res) => {
    const pageNumber = req.query.page || 1;
    try{
        const blogs = await Blog.find({})
                                .skip((perPage*pageNumber) - perPage)
                                .limit(perPage);
        const blogsLength = await Blog.count();
        const lastPageNumber = blogsLength > perPage ? Math.ceil(blogsLength/perPage) : 1;
        res.render("blog/index.ejs", {
            page: "blog",
            blogs,
            pageNumber,
            lastPageNumber
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const blogSchema = Joi.object({
    title: Joi.string().required(),
    user: Joi.string().required(),
    body: Joi.string().required(),
})

router.get("/add", isAuthenticated, async (req, res) => {
    res.render("blog/add-blog.ejs", {
        page: "addBlog"
    })
})

router.post("/add", isAuthenticated, async (req, res) => {
    const data = req.body;
   try{
        const isValid = await blogSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/blog?error=${isValid.error.message}`);
        const newBlog = await Blog.create(data);
        res.redirect(`/blog?addSuccessful=true&name=${newBlog.title}`);
   } 
   catch(err){
       console.log(err);
       const error = err.details ? err.details[0].message : err._message;
       res.redirect(`/blog?error=${error}`);
   }
})

router.post("/update/:id", isAuthenticated, async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    try{
        const isValid = await blogSchema.validateAsync(data);
        if (isValid.error) return res.redirect(`/blog?error=${isValid.error.message}`);
        await Blog.updateOne({_id: id}, data);
        res.redirect(`/blog?updateSuccessul=true&name=${data.title}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.detila[0].message : err._message;
        res.redirect(`/blog?error=${error}`);
    }
})

router.delete("/:id", isAuthenticated, async (req, res) => {
    try{
        await Blog.deleteOne({_id: req.params.id});
        res.redirect(`/blog?deleteSuccessful=true`)
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
    }
})

module.exports = router;