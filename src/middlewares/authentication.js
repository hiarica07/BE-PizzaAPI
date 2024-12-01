"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const Token = require('../models/token')
const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {

    req.user = null

    const auth = req.headers?.authorization // Token ...tokenKey... || Bearer ...accessToken...
    const tokenKey = auth ? auth.split(' ') : null // ['Token', '...tokenKey...'] || ['Bearer', '...accessToken...']

    //? Örnek için projede ikisini de kullandık. Normalde sadece birini kullanacağız(yani tek bir if yapacağız)
    if (tokenKey) {
            // Simple token varsa // Token kullanıyoruz
        if (tokenKey[0] == 'Token') { // SIMPLE TOKEN

            const tokenData = await Token.findOne({ token: tokenKey[1] }).populate('userId')
            req.user = tokenData ? tokenData.userId : false
                // JWT varsa: //! databese'e gitmeden user bilgilerine ulaşabilmiş oluyoruz // Bearer kullanıyoruz
        } else if (tokenKey[0] == 'Bearer') { // JWT

            // databese'e gitmeden user bilgilerine ulaşabilmiş oluyoruz //* token'ın doğruluğunu verify ile kontrol etmek için yazıyoruz (sign ile token oluşturuyoruz-verify ile doğruluk kontrol ediyoruz)
            jwt.verify(tokenKey[1], process.env.ACCESS_KEY, (err, accessData) => { // verify async olduğu için buradaki response bir callback içinde dönecek // verify patlarsa err dolu gelecek, başarılı olursa accessData dolu gelecek
                // console.log('err-->', err);
                // console.log('accessData--', accessData);
                req.user = accessData ? accessData : null
            })
        }
    }
    next()
}