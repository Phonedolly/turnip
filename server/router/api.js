const express = require('express')
const router = express.Router();
const { utcToZonedTime, format } = require('date-fns-tz')
const { redisClient, now } = require('../server')

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
    if (process.env.NODE_ENV === 'dev') {
      console.log("Use Cache to getSitemap");
    }
    return res.send(cache.map((each) => {
      const parse = JSON.parse(each)
      return Object.assign({}, { title: parse.title, thumbnailURL: parse.thumbnailURL ?? null, postURL: parse.postURL, postDate: parse.postDate })
    }))
  }

  console.log('캐시 가져오기 실패')

  console.log("Not use Cache to getSitemap")
  Post.find({}).sort({ "_id": -1 }).limit(20)
    .then((result) => {
      /* UTC(mongodb) to local time */
      timeAlignedResult = postTimeAlignmentor(result)

      res.send(timeAlignedResult)

      sitemapCacheUpdator(true)

    }, (err) => {
      console.error(err);
      console.error(now() + "get sitemap error");
      res.statusCode = 500;
      res.status(500).send();
    })
});


router.get('/getSitemap/more/:moreIndex', async (req, res) => {
  const moreIndex = req.params.moreIndex;

  /* 최신 순으로 한 요청당 20개씩. 20개 이상이 더 존재하는지 확인하기 위해 21개 조회 */
  Post.find({}).sort({ '_id': -1 }).skip(20 * (moreIndex + 1)).limit(21)
    .then((result) => {
      let canMoreSitemap = true;
      if (result.length <= 20) {
        canMoreSitemap = false;
        timeAlignedResult = postTimeAlignmentor(result)
      }
      else {
        timeAlignedResult = postTimeAlignmentor(result.slice(0, 19))
      }

      /* UTC(mongodb) to local time */

      res.send({ canMoreSitemap, morePosts: timeAlignedResult })

    }, (err) => {
      console.error(err);
      console.error(now() + "get sitemap error");
      res.statusCode = 500;
      res.status(500).send();
    })
});

router.post('/search', async (req, res) => {
  const query = req.body.query;

  const result = await Post
    .find({ $or: [{ title: new RegExp(query) }, { content: new RegExp(query) }] })
    .sort({ '_id': -1 })

  res.send(result);
})

router.get('/post/:postURL', async (req, res) => {
  /* 캐시가 있는지 확인 */
  const cache = await redisClient.get(req.params.postURL)

  if (cache) {
    return res.send(JSON.parse(cache))
  }

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
