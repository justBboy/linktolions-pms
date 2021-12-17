const express = require("express");
const {createServer} = require("http");
const {Server} = require("socket.io")
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const routes = require("./routes");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const {setDefaults} = require("./utils");

require("dotenv").config();
require("./config");

app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 5000;

// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET, 
    resave: false, 
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.req = req;
  next();
});

//static configuration
app.use(expressLayouts);
app.use("/static", express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");

//db
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("db successfully connected")
})
.catch(err => {
    console.log(err)
})

//set defaults
setDefaults();

//routes
routes(app, io);

//socket io
io.use((socket, next) => {
    const userid = socket.handshake.auth.uid;
    if (!userid)
        return next (new Error("Invalid user id"));
    socket.userid = userid;
    next(); 
})

httpServer.listen(PORT, (err) => {
    if (err) return;
        console.log("server running on http://localhost:5000");
    }
)
