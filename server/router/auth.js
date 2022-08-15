const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

router.post('/login', isNotLoggedIn, (req, res, next) => {
  try {
    passport.authenticate('local', (passportError, user, info) => {
      if (passportError || !user) {
        console.log(info)
        return res.status(400).json({ message: info.reason ?? "" })
      }

      req.login(user, { session: false }, (loginError) => {
        if (loginError) {
          return res.send(loginError)
        }
      })
      const token = jwt.sign(
        { id: user.id, auth: user.auth },
        process.env.JWT_SECRET
      )
      res.json({ aceessToken: token })
    })(req, res);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.post('/auth', passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      res.json({ result: true });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

// return res.send({
//     accessToken: jwt.sign({
//         id: user.id
//     }, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: '30m',
//         issuer: 'me'
//     }),
//     message: '토큰이 발급되었습니다'
// })

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;