const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Post = require('../schemas/post');

const runner = async () => {
  const prevData = fs.readFileSync(path.join(__dirname, '../../client/build/sitemap.txt'))
  const bulkData = await Post.find({})
  let content = ""
  let sitemapUpdated = false;

  content = bulkData.reduce((acc, cur, index) => {
    return acc.concat(process.env.WEBSITE_URL + '/post/' + cur.postURL + '\n')
  }, "")

  if (prevData !== content) {
    sitemapUpdated = true;
  }

  fs.writeFileSync(path.join(__dirname, '../../client/build/sitemap.txt'), content)
  if (process.env.NODE_ENV === 'dev') {
    console.log("sitemap refreshed")
  }

  if (process.env.NODE_ENV === 'production'
    && fs.existsSync(path.join(__dirname, '../../client/build/sitemap.txt'))
    && sitemapUpdated) {
    axios.get('https://www.google.com/ping?sitemap=https://stardue64.com/sitemap.txt');
    console.log('send sitemap update ping to google')
  }
}

const sitemapGenarator = () => {
  return setInterval(runner, process.env.SITEMAP_REFRESH_TIME)
}

module.exports = sitemapGenarator;
