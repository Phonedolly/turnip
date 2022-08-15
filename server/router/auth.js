const express = require('express')
const router = express.Router()
const passport = require('passport')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        console.log("AUA")
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
            return res.redirect('/')
        })
    })(req, res, next);
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;