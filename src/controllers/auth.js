"use strict"
const passwordEncrypt = require("../helpers/passwordEncrypt")
const Token = require("../models/token")
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const User = require("../models/user")
const jwt = require("jsonwebtoken")

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
/*********************************************************************************** */
/*********************************************************************************** */
/*********************************************************************************** */
            /*  JWT  */
        const accessData = {
            _id: user._id,
            userName: user.userName,
            email:user.email,
            isActive:user.isActive,
            isAdmin:user.isAdmin
        }

        // Conver to JWT
        // jwt.sign(payload,key,{expireIn:3m})

        const accessToken = jwt.sign(accessData,process.env.ACCESS_KEY, {expiresIn:"30m"})

        //RefreshToken:

        const refreshData = {
            _id:user._id,
            password: user.password
        }

        // Convert to JWT

        const refreshToken = jwt.sign(refreshData,process.env.REFRESH_KEY,{expiresIn:"1d"})

 
         res.send({
            error: false,
            token: tokenData.token,
            bearer: {
                access: accessToken,
                refresh: refreshToken
            },
            user
        });
    },
    logout: async (req, res) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "simpleToken: Logout"
            #swagger.description = 'Delete token key.'
        */
        const auth = req.headers?.authorization // "Token token"
        const tokenKey = auth ? auth.split(" ") : null // [Token, tokenKey]
        // const result = await Token.deleteOne({token: tokenKey[1]}) // Bu kısmı simple token silme işleminin içine aldık
        
        // Simple token için silme işlemi
        if (tokenKey[0] === "Token") {
            const result = await Token.deleteOne({token: tokenKey[1]})
            res.send({
                error: false,
                message: "Token deleted!",
                result
            })
            // JWT için silme işlemi
        } else if (tokenKey[0] === "Bearer") { // süreli olduğu ve expire'a göre silindiği için yapılabilecek birşey yok, gerek yok.
            res.send({
                error: false,
                message: "JWT: No need any process for logout. Yo can delete tokens!"
            })
        }
            // Bu kısmı simple token silme işleminin içine aldık
        // res.status(result.deletedCount ? 204 : 404).send({
        //     error: !(result.deletedCount),
        //     message: "Token deleted.Logout success!",
        //     result
        // })
    },


    refresh: async (req, res) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Refresh"
            #swagger.description = 'Refresh with refreshToken for get accessToken'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "bearer": {
                        refresh: '...refresh_token...'
                    }
                }
            }
        */

        const refreshToken = req.body?.bearer?.refresh // icinde _id ve password var //* login'den veriyoruz

        if (!refreshToken) {
            res.errorStatusCode = 401
            throw new Error('Please enter bearer.refresh')
        }

        const refreshData = await jwt.verify(refreshToken, process.env.REFRESH_KEY) // üçüncü değişkeni dışarda da kullanacağımız için burada yazamıyoruz. Bunun için alttaki if'i yazıyoruz. Hata aldığında refreshData boş dönecek ve aşağıdakine göre hata göndermiş olacağız

        if (!refreshData) {
            res.errorStatusCode = 401
            throw new Error('JWT refresh Token is wrong.')
        }

        const user = await User.findOne({ _id: refreshData._id })

        if (!(user && user.password == refreshData.password)) {
            res.errorStatusCode = 401
            throw new Error('Wrong id or password.')
        }

        if (!user.isActive) {
            res.errorStatusCode = 401
            throw new Error("This account is not active.")
        }

        res.status(200).send({ // yenilenmiş refresh olmuş access token'ı oluşturmuş oluyoruz
            error: false,
            bearer: {
                access: jwt.sign(user.toJSON(), process.env.ACCESS_KEY, { expiresIn: '30m' }) // (içine saklayacağımız bilgiler (şifrelemek istediğimiz data), şifrelediğimiz accessKey, ve expire süresi) sign methodunun değişkenleri // içine göndereceğimiz data'yı yani user'ı(database'den gönderiyoruz) direk gönderemiyor hata veriyor bunu json'a çevirmemizi istiyor
            }
        })
    },
}