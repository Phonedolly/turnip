const express = require('express')
const { nca2md } = require('nca2md');
const router = express.Router();
const { redisClient, now, s3 } = require('../server')

const auth = require('./auth');
const createdPost = require('./publish');
const category = require('./category');

const postTimeAlignmentor = require('../tools/postTimeAlilgnmentor');
const sitemapCacheUpdator = require('../tools/sitemapCacheUpdator');
const checkCanLoadMore = require('../tools/checkCanLoadMore');

const Post = require('../schemas/post');
const Category = require('../schemas/category');
const { format, utcToZonedTime } = require('date-fns-tz');


router.use('/auth', auth)
router.use('/publish', createdPost)
router.use('/category', category);

router.get('/', (req, res) => {
  res.send({ test: 'hi' })
});

router.get('/getRecentSitemap/:moreIndex', async (req, res) => {
  const moreIndex = Number(req.params.moreIndex) ?? 0;
  if (moreIndex === 0) {
    /* redis에서 캐시가 있는지 확인 */
    const cache = await redisClient.lRange('sitemapCache', 0, -1);
    if (cache) {
      const canLoadFirstMoreSitemap = (await redisClient.get("sitemapCacheCanLoadMore")) === "true" ? true : false;
      if (!canLoadFirstMoreSitemap) {
        sitemapCacheUpdator(true)
      }
      //redisClient.get("sitemapCacheCanLoadMore").then((result) => console.log(result))
      if (cache) {
        if (process.env.NODE_ENV === 'dev') {
          console.log("Use Cache to getSitemap");
        }

        return res.send({
          sitemap: cache.map((each) => {
            const eachParsed = JSON.parse(each)
            return Object.assign({}, { title: eachParsed.title, thumbnailURL: eachParsed.thumbnailURL ?? null, postURL: eachParsed.postURL, postDate: eachParsed.postDate })
          },
          ),
          canLoadMoreSitemap: canLoadFirstMoreSitemap
        })
      }
    }
    if (!cache) {
      console.log(now() + '캐시 가져오기 실패')
      console.log(now() + "Not use Cache to getSitemap")
    }
  }


  Post.find({}).sort({ "_id": -1 }).limit(20).skip(20 * moreIndex).limit(20)
    .then(async (result) => {
      /* 포스트를 20개 외에 더 로드할 수 있는지 확인 */
      const canLoadMoreSitemap = await checkCanLoadMore({}, moreIndex);

      /* UTC(mongodb) to local time */
      timeAlignedResult = postTimeAlignmentor(result);

      res.send({ sitemap: timeAlignedResult, canLoadMoreSitemap });
    }, (err) => {
      console.error(err);
      console.error(now() + "failed to get more sitemap");
      return res.status(500).send();
    })
});

router.post('/getCategorySitemap', async (req, res) => {
  const moreIndex = req.body.moreIndex ?? 0;
  const categoryName = req.body.categoryName;
  const categoryId = (await Category.findOne({ "name": categoryName }))._id.toString();

  const categorySitemap = (await Post
    .find({ category: { _id: categoryId } })
    .sort({ "_id": -1 })
    .skip(20 * moreIndex)
    .limit(20)
  )

  // TODO 중복 코드 제거하기
  const canLoadMoreSitemap = await checkCanLoadMore({ category: { _id: categoryId } }, moreIndex);
  res.send({ sitemap: categorySitemap.map((eachPost) => ({ title: eachPost.title, thumbnailURL: eachPost.thumbnailURL ?? null, postURL: eachPost.postURL, postDate: format(utcToZonedTime(eachPost.createdAt), 'yyyy-MM-dd') })), canLoadMoreSitemap });
})


router.post('/search', async (req, res) => {
  const query = req.body.query;
  if (query === "") {
    return res.send([]);
  }
  const result = await Post
    .find({ $or: [{ title: new RegExp(query) }, { content: new RegExp(query) }] })
    .sort({ '_id': -1 })

  res.send(result);
})

router.get('/post/:postURL', async (req, res) => {
  /* 캐시가 있는지 확인 */
  // const cache = await redisClient.get(encodeURIComponent(req.params.postURL))

  // if (cache) {
  //   console.log("use cache to post");
  //   return res.send(JSON.parse(cache))
  // }

  Post.findOne({ postURL: req.params.postURL })
    .then((result) => {
      res.send(result)

      /* 보냈던 포스트를 캐싱 */
      redisClient.set(encodeURIComponent(req.params.postURL), JSON.stringify(result))
    }, (error) => {
      console.error(error)
      res.status(500).send();
    })
})

router.get('/getDefaultImportClubID', (req, res) => {
  res.send({ defaultImportClubID: process.env.DEFAULT_IMPORT_CLUB_ID });
})

router.post('/import', async (req, res) => {
  const clubID = req.body.clubID;
  const articleNumber = req.body.articleNumber;
  const importResult = await nca2md(clubID, articleNumber, s3, process.env.S3_BUCKET, false)
  res.send(importResult);
})


module.exports = router;
