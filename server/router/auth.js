const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

router.post('/login', isNotLoggedIn, (req, res, next) => {
    console.log("AUA")
    passport.authenticate('local', (authError, user, info) => {

        if (authError) {
            console.error(authError);
            return next(authError)
        }
        if (!user) {
            return res.redirect('/');
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.send({
                accessToken: jwt.sign({
                    id: user.id
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '30m',
                    issuer: 'me'
                }),
                message: '토큰이 발급되었습니다'
            })
        })
    })(req, res, next);
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;