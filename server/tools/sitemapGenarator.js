const fs = require('fs');
const path = require('path');
const Post = require('../schemas/post');

const runner = async () => {
  let content = ""

  const bulkData = await Post.find({})

  content = bulkData.reduce((acc, cur, index) => {
    return acc.concat(process.env.WEBSITE_URL + '/post/' + cur.postURL + '\n')
  }, "")

  fs.writeFile(path.join(__dirname, '../../client/build/sitemap.txt'), content, (err) => {
    if (err) {
      console.error('file open error')
      console.error(err)
    }
  })
  console.log("sitemap refreshed")
}
const sitemapGenarator = () => {
  return setInterval(runner, process.env.SITEMAP_REFRESH_TIME)
}
module.exports = sitemapGenarator;