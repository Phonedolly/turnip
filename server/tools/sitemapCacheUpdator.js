const { redisClient } = require('../server')

const postTimeAlignmentor = require('./postTimeAlilgnmentor')

const Post = require('../schemas/post')

const runner = () => {
    Post.find({}).sort({ createdAt: -1 })
        .then((result) => {
            /* UTC(mongodb) to local time */
            const timeAlignedResult = postTimeAlignmentor(result)


            const multi = redisClient.multi()

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

const sitemapCacheUpdator = () => {
    setTimeout(runner, process.env.SITEMAP_CACHE_REFRESH_TIME)
}

module.exports = sitemapCacheUpdator;
