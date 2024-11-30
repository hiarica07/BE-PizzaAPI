"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const User = require("../models/user")

module.exports = {
    login: async (req, res) => {
        res.status(200).send({
            message: "Login Successfull"
        })
    },
    logout: async (req, res) => {
        res.status(200).send({
            message: "Login Successfull"
        })
    },
}