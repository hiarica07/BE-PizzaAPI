"use strict"

const Token = require("../controllers/token")

/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

module.exports = async (req,res,next) => {
    req.user = null

    const auth = req.headers.authorization
    const tokenKey = auth ? auth.split(" ") : null

    if (tokenKey && tokenKey[0] == "Token"){
        const tokenData = await Token.findOne({token: tokenKey[1]})

        req.user = tokenData ? tokenData.userId : false

    }
    next()
}

