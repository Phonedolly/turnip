const express = require('express')
const router = express.Router();
const { redisClient } = require('../server')

const auth = require('./auth')
const createdPost = require('./publish')

const Post = require('../schemas/post');


const { verifyToken } = require('./jwt');
const { AnalyticsExportDestinationFilterSensitiveLog } = require('@aws-sdk/client-s3');

router.use('/auth', auth)
router.use('/publish', createdPost)


router.get('/', (req, res) => {
  res.send({ test: 'hi' })
});

router.get('/getArtTitleList', async (req, res) => {
  /* redis에서 캐시가 있는지 확인 */
  const cache = await redisClient.lRange('artTitleListCache', 0, -1)
  if (cache?.length !== 0) {
    return res.send(cache.map((each) => {
      const parse = JSON.parse(each)
      return Object.assign({}, { title: parse.title, thumbnailURL: parse.thumbnailURL ?? null, postURL: parse.postURL, postDate: parse.createdAt })
    }))

  }

  Post.find({}).sort({ createdAt: -1 })
    .then((result) => {
      res.send(result.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null, postURL: each.postURL, postDate: each.createdAt })))

      /* 찾은 값을 30개까지 캐시에 저장 */
      const multi = redisClient.multi()

      slicedResult = result.slice(0, result.length >= 30 ? 29 : result.length)
      redisClient.del('artTitleListCache')
      for (let i = 0; i < slicedResult.length; i++) {
        multi.rPush("artTitleListCache", JSON.stringify(slicedResult[i]))
      }

      multi.exec()
        .then((multiResult) => { console.log(multiResult) },
          (multiError) => { console.log(multiError) })
    }, (err) => {
      console.error(err);
      console.error("get title error");
      res.statusCode = 500;
      res.statusMessage = "get title error";
      res.send();
    })

});

router.get('/post/:postURL', async (req, res) => {
  /* 캐시가 있는지 확인 */
  const cache = await redisClient.get(req.params.postURL)

  if (cache) {
    return res.send(JSON.parse(cache))
  }

  console.log(req.params.postURL)
  Post.findOne({ postURL: req.params.postURL })
    .then((result) => {
      res.send(result)

      /* 보냈던 포스트를 캐싱 */
      redisClient.set(req.params.postURL, JSON.stringify(result))
    }, (error) => {
      console.error(error)
      res.status(500).send();
    })


})

module.exports = router;
