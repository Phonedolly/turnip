const express = require('express')
const router = express.Router();
const { utcToZonedTime, format } = require('date-fns-tz')
const { redisClient } = require('../server')

const auth = require('./auth')
const createdPost = require('./publish')

const Post = require('../schemas/post');

router.use('/auth', auth)
router.use('/publish', createdPost)


router.get('/', (req, res) => {
  res.send({ test: 'hi' })
});

router.get('/getSitemap', async (req, res) => {
  /* redis에서 캐시가 있는지 확인 */
  try {
    const cache = await redisClient.lRange('getSitemap', 0, -1)
    if (cache?.length !== 0) {
      return res.send(cache.map((each) => {
        const parse = JSON.parse(each)
        return Object.assign({}, { title: parse.title, thumbnailURL: parse.thumbnailURL ?? null, postURL: parse.postURL, postDate: parse.postDate })
      }))
    }
  } catch (e) {
    console.error(e)
    console.error('캐시 가져오기 오류')
  }


  Post.find({}).sort({ createdAt: -1 })
    .then((result) => {

      /* UTC(mongodb) to local time */
      timeAlignedResult = result.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null, postURL: each.postURL, postDate: format(utcToZonedTime(each.createdAt), 'yyyy-M-dd') }))

      res.send(timeAlignedResult)

      /* 찾은 값을 30개까지 캐시에 저장 */
      const multi = redisClient.multi()

      timeAlignedslicedResult = timeAlignedResult.slice(0, result.length >= 30 ? 29 : result.length)
      redisClient.del('sitemapCache')
      for (let i = 0; i < timeAlignedslicedResult.length; i++) {
        multi.rPush("sitemapCache", JSON.stringify(timeAlignedslicedResult[i]))
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
