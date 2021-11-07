const bcrypt = require("bcrypt");
function randomIn(items){
    return items[Math.floor(Math.random() * items.length)];
}

function genShortId(){
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "123456789";
    let id = "";

    for (let i = 0; i < 3; i++){
        id += randomIn(letters);
    }
    id += "-";
    for (let i = 0; i<5; i++){
        id += randomIn(numbers);
    }
    return id;
}

 function daysInMonth(month, year){
    let d = new Date(year, month+1, 0);
    return d.getDate();
}

const hashPassword = async (password, saltRounds = 10) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);

        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.log(error);
    }

    return null;
};

const comparePassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.log(error);
    }

    return false;
};

const isAuthenticated = function(req, res, next){
    const nextUrl = req.originalUrl;
    if(req.user) 
        return next();
    else
        return res.redirect(`/auth/login?next=${nextUrl}`);
}

module.exports = {
    randomIn,
    genShortId,
    daysInMonth,
    hashPassword,
    comparePassword,
    isAuthenticated
}