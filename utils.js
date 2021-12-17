const bcrypt = require("bcrypt");
const Role = require("./models/Role");
const Permissions = require("./models/Permissions");
const {roles} = require("./constants");
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

const createDefaultRoles = async () => {
    const superAdmin = await Role.create({title: "Super Admin", role: roles.SUPERADMIN});
    const admin = await Role.create({title: "Admin", role: roles.ADMIN});
    const employee = await Role.create({title: "Employee", role: roles.EMPLOYEE});
    return {superAdmin, admin, employee};
}

const createDefaultPermissions = async () => {
    const roles = await createDefaultRoles();
    const superAdmin = await Permissions.create({
        role: roles.superAdmin._id,
        permissions: {
            user: {
                read: true,
                write: true,
                delete: true,
            }
        }
    })

    const admin = await Permissions.create({
        role: roles.admin._id,
        permissions: {
            user: {
                read: true,
                write: true,
                delete: false
            }
        }
    })

    const employee = await Permissions.create({
        role: roles.employee._id,
        permissions: {
            user: {
                read: true,
                write: false,
                delete: false
            }
        }
    })

    return {permissions: {superAdmin, admin, employee}, roles};
}

const setDefaultPermissions = async () => {
    const rolesLength = await Role.count();
    const permissionsLength = await Role.count();
    if(!rolesLength && !permissionsLength){
        const {permissions, roles} = await createDefaultPermissions();
        await Role.findByIdAndUpdate(roles.superAdmin._id, {permissions: permissions.superAdmin._id});
        await Role.findByIdAndUpdate(roles.admin._id, {permissions: permissions.admin._id});
        await Role.findByIdAndUpdate(roles.employee._id, {permissions: permissions.employee._id});
    }
}

const setDefaults = () => {
    setDefaultPermissions();
}

module.exports = {
    randomIn,
    genShortId,
    daysInMonth,
    hashPassword,
    comparePassword,
    isAuthenticated,
    setDefaults
}