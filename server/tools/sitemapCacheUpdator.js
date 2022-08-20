const { redisClient } = require('../server')

const postTimeAlignmentor = require('./postTimeAlilgnmentor')

const Post = require('../schemas/post')

const runner = () => {
  Post.find({}).sort({ createdAt: -1 })
    .then((result) => {
      /* UTC(mongodb) to local time */
      const timeAlignedResult = postTimeAlignmentor(result)

      const multi = redisClient.multi()

      /* 찾은 값을 15개까지 캐시에 저장 */
      timeAlignedslicedResult = timeAlignedResult.slice(0, result.length >= 15 ? 14 : result.length)
      redisClient.del('sitemapCache')
      for (let i = 0; i < timeAlignedslicedResult.length; i++) {
        multi.rPush("sitemapCache", JSON.stringify(timeAlignedslicedResult[i]))
      }

      multi.exec()
        .then((multiResult) => { console.log(multiResult) },
          (multiError) => { console.log(multiError) })

      console.log("sitemapCache updated");
    })
}

const sitemapCacheUpdator = (isInstantRun) => {
  if (isInstantRun) {
    runner()
    console.log("sitemap instantly updated")
  } else {
    setInterval(runner, process.env.SITEMAP_CACHE_REFRESH_TIME)
  }

}

module.exports = sitemapCacheUpdator;
