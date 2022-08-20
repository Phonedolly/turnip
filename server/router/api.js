const express = require('express')
const router = express.Router();
const { utcToZonedTime, format } = require('date-fns-tz')
const { redisClient } = require('../server')

const auth = require('./auth')
const createdPost = require('./publish')
const postTimeAlignmentor = require('../tools/postTimeAlilgnmentor')
const sitemapCacheUpdator = require('../tools/sitemapCacheUpdator')

const Post = require('../schemas/post');

router.use('/auth', auth)
router.use('/publish', createdPost)


router.get('/', (req, res) => {
  res.send({ test: 'hi' })
});

router.get('/getSitemap', async (req, res) => {
  /* redis에서 캐시가 있는지 확인 */
  const cache = await redisClient.lRange('sitemapCache', 0, -1)
  if (cache?.length !== 0) {
    console.log("Use Cache to getSitemap");
    return res.send(cache.map((each) => {
      const parse = JSON.parse(each)
      return Object.assign({}, { title: parse.title, thumbnailURL: parse.thumbnailURL ?? null, postURL: parse.postURL, postDate: parse.postDate })
    }))
  }

  console.log('캐시 가져오기 실패')


  console.log("Not use Cache to getSitemap")
  Post.find({}).sort({ createdAt: -1 })
    .then((result) => {

      /* UTC(mongodb) to local time */
      timeAlignedResult = postTimeAlignmentor(result)

      res.send(timeAlignedResult)

      /* 찾은 값을 15개까지 캐시에 저장 */
      sitemapCacheUpdator(true)

    }, (err) => {
      console.error(err);
      console.error("get sitemap error");
      res.statusCode = 500;
      res.status(500).send();
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
