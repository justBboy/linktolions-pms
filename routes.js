const {router: messengerRouter, initializeSocket} = require("./routes/messenger");
module.exports = function(app, io){
    app.use("/", require("./routes/home"));
    app.use("/contact", require("./routes/contact"));
    app.use("/email", require("./routes/email"));
    app.use("/messenger", messengerRouter);
    app.use("/project", require("./routes/project"));
    app.use("/calender", require("./routes/calender"));
    app.use("/auth", require("./routes/auth"));
    app.use("/jobportal", require("./routes/jobportal"));
    app.use("/profile", require('./routes/profile'));
    app.use("/news", require('./routes/news'));
    app.use('/social', require('./routes/social'));
    app.use('/blog', require('./routes/blog'));
    initializeSocket(io);
}