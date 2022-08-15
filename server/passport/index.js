const passport = require('passport');
const local = require('./localStrategy');
const User = require('../schemas/user');

module.exports = () => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
        console.log('aaa')
    });

    passport.deserializeUser((id, done) => {
        console.log('bbb')
        User.findOne({ where: { id } })
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local();
};