const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto')

const User = require('../schemas/user')


const makePasswordHashed = (userId, plainPassword) =>
    new Promise(async (resolve, reject) => {
        const salt = await User.find({ id: userId })
            .then((result) => { console.log(result); return result[0].salt });
        console.log(salt)
        crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve(key.toString('base64'));
        });
    });

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password'
    }, async (id, password, done) => {
        try {
            const exUser = await User.findOne({ where: { id } });
            if (exUser) {
                const result = (await makePasswordHashed(id, password)) === await User.find({ id: req.body.id }).then(res => res[0].password)
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다' })
            }
        } catch (error) {
            console.error(error)
            done(error)
        }
    }))
}


