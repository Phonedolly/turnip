const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const redis = require('redis')

const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect();


router.post('/login', isNotLoggedIn, (req, res, next) => {
  try {
    passport.authenticate('local', async (passportError, user, info) => {
      if (passportError || !user) {
        console.log(info)
        return res.status(400).json({ message: info.reason ?? "" })
      }

      req.login(user, { session: false }, (loginError) => {
        if (loginError) {
          return res.send(loginError)
        }
      })
      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
      )
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '3h' }
      )
      await redisClient.set(refreshToken, user.id);
      res.json({
        accessToken,
        refreshToken
      })
    })(req, res);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.post('/silentRefresh', (req, res) => {
  console.log(req.body)
  jwt.verify(req.body.refreshToken, process.env.REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if (error) {
        console.error(error)
        res.status(500).json({ JWTisValid: false })
      }
    })
  const accessToken = jwt.sign(
    { id: redisClient.get(req.body.refreshToken) },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )
  const refreshToken = jwt.sign(
    { id: redisClient.get(req.body.refreshToken) },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '3h' }
  )
  res.send({ accessToken, refreshToken })
})

// router.post('/', passport.authenticate('jwt', { session: false }),
//   async (req, res, next) => {
//     try {
//       console.log(req)
//       res.json({ isLoggedIn: true });
//     } catch (error) {
//       console.error(error);
//       res.json({ isLoggedIn: false })
//       next(error);
//     }
//   });
// router.get('/', passport.authenticate('jwt',{session:false}), as(req, res) => {
//   res.send("로그인했음")
// })

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
  // req.logout();
  // req.session.destroy();
  // res.redirect('/');
  return res.clearCookie('user').end()
});

module.exports = router;