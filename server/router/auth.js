const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const redis = require('redis')
const crypto = require('crypto')

const User = require('../schemas/user')

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect();


const makePasswordHashed = (userId, plainPassword, res) =>
  new Promise(async (resolve, reject) => {
    console.log(userId, plainPassword);
    const salt = await User.findOne({ id: userId })
      .then((result) => {
        console.log(result);
        if (!result) {
          console.error("없는 정보")

          return "NOT_VALID"
        }
        return result.salt
      });
    console.log(salt)
    crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
      if (err) reject(err);
      resolve(key.toString('base64'));
    });
  });


const isLoggedIn = async (req, res, next) => {
  console.log(111111)
  if (!req.headers.authorization) {
    return res.status(500).send("!req.headers.authorization");
  }

  if ((await redisClient.get(req.headers.authorization.split(" ")[1])) === 'logout') {
    return res.status(500).send("blacklisted");
  }
  jwt.verify(req.headers.authorization.split(" ")[1], process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      console.error(error)
      return res.status(500).json({ JWTisValid: false })
    } else {
      console.log("verify sucess");
      next()
    }
  })
}

router.post('/login', async (req, res) => {

  const hashed = (await makePasswordHashed(req.body.id, req.body.password, res))
  const origin = await User.findOne({ id: req.body.id })
    .then(res => res?.password,
      (err) => { console.error("비밀번호 에러"); })

  const compareResult = hashed === origin

  if (!compareResult || !hashed || !origin) {
    return res.status(500).send("Login Failed")
  }

  const accessToken = jwt.sign(
    { id: req.body.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )
  const refreshToken = jwt.sign(
    { id: req.body.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '300m' }
  )

  console.log('aaasdasdff')
  await redisClient.setEx(refreshToken, 1800000, req.body.id);
  res.cookie('refreshToken', refreshToken)
  res.json({ accessToken })
})


router.get('/silentRefresh', (req, res) => {
  if (!req.cookies.refreshToken) {
    return res.status(500).send("refresh Token 없음")
  }
  jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if (error) {
        console.error(error)
        res.status(500).json({ JWTisValid: false })
      }
    })
  const accessToken = jwt.sign(
    { id: redisClient.get(req.cookies.refreshToken) },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )
  const refreshToken = jwt.sign(
    { id: redisClient.get(req.cookies.refreshToken) },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '300m' }
  )
  res.cookie('refreshToken', refreshToken)
  res.send({ accessToken })
})



router.get('/check', isLoggedIn, (req, res) => {
  res.status(200).send("로그인 되어있음")
})


router.get('/logout', isLoggedIn, async (req, res) => {
  console.log(req.headers.authorization.split(" ")[1])

  await redisClient.setEx(req.headers.authorization.split(" ")[1], 1800000, 'logout')
  res.clearCookie('refreshToken');
  return res.status(200).send();


});


module.exports = router;