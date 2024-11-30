"use strict"
const passwordEncrypt = require("../helpers/passwordEncrypt")
const Token = require("../models/token")
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const User = require("../models/user")

module.exports = {
    login: async (req, res) => {

        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password for get simpleToken and JWT'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "test",
                    "password": "aA?123456",
                }
            }
        */

        const {userName,email,password} = req.body 

        if(!((userName || email) && password)) {

            res.errorStatusCode = 401
            throw new Error("Username/Email and Password required")
        }

        const user = await User.findOne({$or:[{userName},{email}]})

        if (user?.password !== passwordEncrypt(password)) {
            res.errorStatusCode = 401
            throw new Error("Username/Email and Password invalid")
        }

        if (!user?.isActive) {
            res.errorStatusCode = 401
            throw new Error("User is not active")
        }

        let tokenData = Token.findOne({userId: user._id})

        if (!tokenData) {
            tokenData = await Token.create({
                userId: user._id,
                token: passwordEncrypt(user._id + Date.now())
            })
        }

 
        res.status(200).send({
            message: "Login Successfull"
        })
    },
    logout: async (req, res) => {

        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "simpleToken: Logout"
            #swagger.description = 'Delete token key.'
        */

        res.status(200).send({
            message: "Login Successfull"
        })
    },
}