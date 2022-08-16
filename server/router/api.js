const express = require('express')
const router = express.Router();
const crypto = require('crypto')


const createdPost = require('./publish')

const Post = require('../schemas/post');
const User = require('../schemas/user');

const { verifyToken } = require('./jwt')

router.use('/publish', createdPost)

router.get('/', (req, res) => {
  res.send({ test: 'hi' })
});

router.get('/getArtTitleList', async (req, res) => {
  Post.find({}).sort({ createdAt: -1 })
    .then((result) => {
      console.log('result: ' + result)
      res.send(result.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null, postURL: each.postURL })))
    }, (err) => {
      console.error(err);
      console.error("get title error");
      res.statusCode = 500;
      res.statusMessage = "get title error";
      res.send();
    })
});


router.get('/post/:postURL', async (req, res) => {
  console.log(req.params.postURL)
  Post.findOne({ postURL: req.params.postURL })
    .then((result) => {
      res.send(result)
    }, (error) => {
      console.error(error)
      res.status(500).send();
    })
})

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

module.exports = router;
