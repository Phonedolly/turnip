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

module.exports = router;
