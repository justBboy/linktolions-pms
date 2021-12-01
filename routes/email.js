const express = require("express");
const router = express.Router()
const {isAuthenticated} = require('../utils');
const {transporter, imap} = require("../config");
const Mail = require("../models/Mail");
const Joi = require("joi");


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

const emailComposeSchema = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    html: Joi.string().required()
})

router.post("/compose", isAuthenticated, async (req, res) => {
    const data = req.body;
    const user = req.user;
    try{
        const isValid = await emailComposeSchema.validateAsync(data);
        if(isValid.error) return res.json({error: isValid.error.message});
        const {to, subject, html} = data;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        })
        await Mail.create({...data, drafted: false, trashed: false, sender: user._id});
        res.json({success: true, title: to})
    }
    catch(err) {
        console.log(err);
        const error = err.details ? err.details[0].message : err._message ? err._message : err;
        res.json({error});
    }
})

const perPage = 5;
router.get("/all", isAuthenticated, async (req, res) => {
    const filter = req.query.filter;
    const pageNumber = req.query.page || 1;
    try{
        let mails;
        let mailsLength;
        switch(filter){
            case "sentMails":
                mails = await Mail.find({drafted: false, trashed: false})
                                        .skip((perPage * pageNumber) - perPage)
                                        .limit(perPage)
                                        .populate("sender")
                                        .exec();
                mailsLength = await Mail.find({drafted:false, trashed: false}).count();
                break;
            case "inboxMails":
                mails = [];
                mailsLength = 0;
                break;
            case "draftMails":
                mails = await Mail.find({drafted: true, trashed: false})
                                        .skip((perPage * pageNumber) - perPage)
                                        .limit(perPage)
                                        .populate("sender")
                                        .exec();
                mailsLength = await Mail.find({drafted:true, trashed: false}).count();
                break;
            case "trashMails":
                mails = await Mail.find({trashed: true})
                                    .skip((perPage * pageNumber) - perPage)
                                    .limit(perPage)
                                    .populate("sender")
                                    .exec();
                mailsLength = await Mail.find({trashed: true}).count();
                break;
            default:
                mails = []
                mailsLength = 0;
        }
        const lastPageNumber = mailsLength > perPage ? Math.ceil(mailsLength/perPage) : 1;
       res.json({mails, mailsLength, lastPageNumber, pageNumber}); 
    }
    catch(err){
        console.log(err);
        let error = err.details ? err.details[0].message : err._message ? err._message : err;
        if(typeof error === "object")
            error = error.code === "EDNS" ? "No internet connection" : "Unknown error happened, try again";
        res.json({error});
    }
})

router.post("/draft", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
       const isValid = await emailComposeSchema.validateAsync(data);
        if(isValid.error) return res.json({error: isValid.error.message});
        await Mail.create({...data, drafted: true, sender: req.user._id})  
        res.json({success: true});
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message ? err._message : err;
        res.json({error});
    }
})

router.delete("/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        const mail = await Mail.findById(id);
        if(mail.trashed){
            console.log("if trashed", mail);
            await Mail.deleteOne({_id: id});
            return res.json({success: true, title: mail.to})
        }
        const updated = await Mail.updateOne({_id: id}, {trashed: true});
        console.log("if not trashed", updated);
        res.json({success: true, title: mail.to});
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message ? err._message : err;
        res.json({error});
    }
})

function openInbox(cb){
    imap.openInbox('INBOX', true, cb);
}

console.log(imap)

imap.once("ready", function(){
    openInbox(function(err, box){
        if (err) throw err;
        console.log(box);
    })
})

module.exports = router;