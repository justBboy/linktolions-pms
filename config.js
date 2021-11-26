const cloudinary = require("cloudinary"),
 passport = require("passport"),
 LocalStrategy = require("passport-local").Strategy,
 nodemailer = require("nodemailer"),
 User = require("./models/User");
 

cloudinary.config({
    cloud_name: process.env.CLD_CLOUD_NAME,
    api_key: process.env.CLD_API_KEY,
    api_secret: process.env.CLD_API_SECRET,
    secure: true
})

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})


passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password"
    },
    async (email, password, done) => {
        try{
            const user = await User.findOne({email});
            if (!user) return done(null, false, {message: "User not found"});
            if (!(await user.validatePassword(password))) return done(null, false, {message: "Incorrect password"});
            return done(null, user);
        }
        catch(err){
            console.log(err);
            return done(err);
        }
    }
))

passport.serializeUser(function(data, done){
    done(null, data._id);
})

passport.deserializeUser(async function(id, done){
    try{
        const user = await User.findById(id);
        done(null, user)
    }
    catch(err){
        done(err)
    }
})

module.exports = {
    transporter
}