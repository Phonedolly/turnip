const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const redis = require('redis')
const crypto = require('crypto')

const User = require('../schemas/user')

const redisClient = redis.createClient({
  host: process.env.REDIS_URL,
  port: 6379,
  password: process.env.REDIS_PASSWORD
});
redisClient.connect();


const createSalt = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('base64'));
    });
  });

const createHashedPassword = (plainPassword) =>
  new Promise(async (resolve, reject) => {
    const salt = await createSalt();
    crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
      if (err) reject(err);
      resolve({ password: key.toString('base64'), salt });
    });
  });

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

  await redisClient.setEx(req.headers.authorization.split(" ")[1],
    process.env.ACCESS_TOKEN_BLACKLIST_EXPIRE_TIME, 'logout')
  res.clearCookie('refreshToken');
  return res.status(200).send();


});

router.post('/createUser', async (req, res) => {
  passwordHashed = await createHashedPassword(req.body.password)
  User.create({ id: req.body.id, password: passwordHashed.password, salt: passwordHashed.salt })
    .then(result => {
      console.log("유저 생성 성공");
      console.log(result);
      res.send("sucesss")
    },
      (error) => {
        console.error("유저 생성 실패")
        console.error(error);
        res.send("error")
      })
})




module.exports = router;