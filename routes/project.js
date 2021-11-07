const router = require("express").Router();
const {Task, categoryTypes} = require("../models/Task");
const Joi = require("joi");
const {genShortId, isAuthenticated} = require("../utils");
const {Project, PRIORITYLIST, STATUSLIST} = require("../models/Project");
const {Ticket, PRIORITYLIST: PRIORITYLIST_TICKETS, DEPARTMENTS} = require("../models/Ticket");
const Client = require("../models/Client");
const {Todo, PRIORITYLIST: PRIORITYLIST_TODO} = require("../models/Todo");

const taskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    category: Joi.string().required()
})

const taskUpdateSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required()
})

router.get("/taskboard", isAuthenticated, async (req, res) => {
    const tasks = await Task.find();
    const plannedTasks = tasks.filter(item => item.category === categoryTypes.PLANNED);
    const completeTasks = tasks.filter(item => item.category === categoryTypes.COMPLETE);
    const incompleteTasks = tasks.filter(item => item.category === categoryTypes.INCOMPLETE);
    const inprogressTasks = tasks.filter(item => item.category === categoryTypes.INPROGRESS);
    res.render("project/taskboard.ejs", {
        page: "taskboard",
        plannedTasks,
        completeTasks,
        incompleteTasks,
        inprogressTasks
    })
})

router.post("/taskboard/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await taskSchema.validateAsync(data);

        if(isValid.error) {
            return res.json({error: isValid.error.message})
        }

        const newTask = await Task.create(data);
        res.json(newTask);
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message});
    }
})

router.post("/taskboard/updateCategory/:id", isAuthenticated, async (req, res) => {
    const newCategory = req.body.newCategory;
    try{
        await Task.updateOne({_id: req.params.id}, {category: newCategory});
        const task = await Task.findOne({_id: req.params.id});
        res.json(task)
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message})
    }
})

router.post("/taskboard/updatetask/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try{
        const isValid = await taskUpdateSchema.validateAsync(data);
        if(isValid.error) return res.json({error: isValid.error.message});
        await Task.updateOne({_id: id}, {...data});
        res.json(data);
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message})
    }
})

router.post("/taskboard/delete/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        await Task.deleteOne({_id: id});
        res.json({title: req.body.title});
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message})
    }
})

const projectSchema = Joi.object({
    owner: Joi.string().required(),
    milestone: Joi.string().required(),
    status: Joi.string().required(),
    work: Joi.number().required(),
    duration: Joi.number().required(),
    priority: Joi.string().required(),
    task: Joi.number(),
})

router.get("/projectlist", isAuthenticated, async (req, res) => {
    try{
        const projects = await Project.find();
        res.render("project/project-list.ejs", {
            page: "projectlist",
            projects,
            PRIORITYLIST,
            STATUSLIST
        })
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message});
    }
})

router.post("/projectlist/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await projectSchema.validateAsync(data);
        if (isValid.error) return res.json({error: isValid.error.message});

        const newProject = await Project.create(data);
        res.redirect(`/project/projectlist?addSuccessful=true&name=${newProject.owner}`);
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message})
    }
})

router.delete("/projectlist/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        await Project.deleteOne({_id: id});
        res.json({message: "success"})
    }
    catch(err){
        console.log(err);
        res.json({error: err.details[0].message});
    }
})

router.post("/projectlist/update/:id", isAuthenticated, async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    try{
        const isValid = await projectSchema.validateAsync(data);
        if (isValid.error) return res.json({error: isValid.error.message});
        await Project.updateOne({_id: id}, data);
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

router.post("/projectlist/search", isAuthenticated, async (req, res) => {
    const {owner, status, priority} = req.body;
    try{
        let projects;

        if (owner) projects = await Project.find({owner});
        if (status) 
            projects = projects ? projects.filter(item => item.status === status) : await Project.find({status})
        if (priority) projects = projects ? projects.filter(item => item.priority === priority) : await Project.find({priority})
        if (!(owner || status || priority)) projects = await Project.find();
        

        res.render("project/project-list.ejs", {
            page: "projectlist",
            projects,
            PRIORITYLIST,
            STATUSLIST
        })
    }catch(err){
        console.log(err)
        res.render("404.ejs");
    }
})

const ticketSchema = Joi.object({
    title: Joi.string().required(),
    priority: Joi.string().required(),
    department: Joi.string().required(),
    agent: Joi.string().required(),
    date: Joi.date().required()
})

router.get("/ticketlist", isAuthenticated, async (req, res) => {
    try{
        const tickets = await Ticket.find();
        res.render("project/ticketlist.ejs", {
            page: "ticketlist",
            tickets,
            PRIORITYLIST_TICKETS,
            DEPARTMENTS
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }

})

router.post("/ticketlist/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await ticketSchema.validateAsync(data);
        if(isValid.error) return res.redirect(`/project/ticketlist?error=${isValid.error.message}`);
        const id = genShortId();
        const newTicket = await Ticket.create({...data, id});
        res.redirect(`/project/ticketlist?addSuccessful=true&name=${newTicket.title}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/project/ticketlist?error=${error}`);
    }
})

router.delete("/ticketlist/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try{
        await Ticket.deleteOne({_id: id});
        res.json({message: "success"})
    }
    catch(err){
        console.log(err);
        res.json({error: err.details ? err.details[0].message : err._message});
    }
})

router.post("/ticketlist/update/:id", isAuthenticated, async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    try{
        const isValid = await ticketSchema.validateAsync(data);
        if (isValid.error) return res.json({error: isValid.error.message});
        await Ticket.updateOne({_id: id}, data);
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

router.post("/ticketlist/search", isAuthenticated, async (req, res) => {
    const {title, id, priority, department, agent, date} = req.body;
    try{
        let tickets;

        if (id){
            tickets = await Ticket.find({id});
        }
        else{
            if (priority) tickets = await Ticket.find({priority});
            if (title) tickets = tickets ? tickets.filter(item => item.priority === priority) : await Ticket.find({priority});
            if (department) tickets = tickets ? tickets.filter(item => item.department === department) : await Ticket.find({department});
            if (agent) tickets = tickets ? tickets.filter(item => item.agent === agent) : await Ticket.find({agent});
            if (date) tickets = tickets ? tickets.fiilter(item => item.date.toString() === date.toString()): await Ticket.find({date});
        }

        if(!tickets){
            tickets = await Ticket.find();
        }

        res.render("project/ticketlist.ejs", {
            page: "ticketlist",
            tickets,
            PRIORITYLIST_TICKETS,
            DEPARTMENTS
        })
    }catch(err){
        console.log(err)
        res.render("404.ejs");
    }
})

router.get("/ticketdetails", isAuthenticated, (req, res) => {
    res.render("project/ticket-details.ejs", {
        page: "ticketdetails"
    })
})

const clientSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    tag: Joi.string().allow('', null),
    facebook: Joi.string().allow('', null),
    slack: Joi.string().allow('', null),
    linkedin: Joi.string().allow('', null),
    skype: Joi.string().allow('', null),
    projectsCount: Joi.number(),
})

router.get("/clients", isAuthenticated, async (req, res) => {
    try{
        const clients = await Client.find();
        res.render("project/clients.ejs", {
            page: "clients",
            clients
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }

})

router.post("/clients/add", isAuthenticated, async (req, res) => {
    const data = req.body;
    try{
        const isValid = await clientSchema.validateAsync(data);
        if(isValid.error) return res.redirect(`/project/clients?error=${isValid.error.message}`);
        const newClient = await Client.create(data);
        res.redirect(`/project/clients?addSuccessful=true&name=${newClient.name}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/project/clients?error=${error}`);
    }
})

router.post("/clients/search", isAuthenticated, async (req, res) => {
    const {name, project} = req.body;
    try{
        let clients = await Client.find();;
        if(name) clients = clients.filter(item => item.name.search(name) !== -1);
        if (project) clients = clients.filter(item => item.project === project)
        res.render("project/clients.ejs", {
            page: "clients",
            clients
        })
    }
    catch(err){
        console.log(err);
        res.render("404.ejs");
    }
})

const todoSchema = Joi.object({
    title: Joi.string().required(),
    priority: Joi.string().required(),
    due: Joi.string().required()
})

router.get("/todolist", isAuthenticated, async (req, res) => {
    try{
        const todos = await Todo.find();
        res.render("project/todo-list.ejs", {
            page: "todolist",
            todos,
            PRIORITYLIST_TODO
        })
    }
    catch(err){
        res.render("404.ejs");
    }

})

router.post("/todolist/add", async (req, res) => {
    const data = req.body;
    console.log(data);
    try{
        const isValid = await todoSchema.validateAsync(data);
        if(isValid.error) return res.redirect(`/project/todolist?error=${isValid.error.message}`);
        const newTodo = await Todo.create(data);
        res.redirect(`/project/todolist?addSuccessful=true&name=${newTodo.title}`);
    }
    catch(err){
        console.log(err);
        const error = err.details ? err.details[0].message : err._message;
        res.redirect(`/project/todolist?error=${error}`);
    }
})

router.post("/todolist/updateCheck/:id", async (req, res) => {
    const {checked} = req.body;
    const id = req.params.id;
    try{
        await Todo.updateOne({_id: id}, {checked});
        res.json({checked});
    }
    catch(err){
        console.log(err);
        res.json({error: err.details ? err.details[0].message : err._message});
    }
})

router.delete("/todolist/:id", async (req, res) => {
    const id = req.params.id;
    try{
        await Todo.deleteOne({_id: id});
        res.json({message: "success"})
    }
    catch(err){
        console.log(err);
        res.json({error: err.details ? err.details[0].message : err._message});
    }
})

module.exports = router;