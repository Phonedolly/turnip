const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Post = require('../schemas/post');

const sitemapReader = (offset) => {
  return fs.readFileSync(path.join(__dirname, `../../client/build/sitemap${offset}.txt`), { encoding: 'utf-8' });
}

const writer = (content, offset) => {
  fs.writeFileSync(path.join(__dirname, `../../client/build/sitemap${offset}.txt`), content)
}

const runner = async () => {
  const mongoBulkData = await Post.find({})
  const numOfOffset = Math.ceil(mongoBulkData / 1000)

  for (let i = 0; i < numOfOffset; i++) {
    const prevData = sitemapReader(i);
    const content = mongoBulkData.slice(i, mongoBulkData.length % 1000)
  }



  const prevData = fs.readFileSync(path.join(__dirname, '../../client/build/sitemap.txt'), { encoding: 'utf-8' })
  const bulkData = await Post.find({})
  let sitemapUpdated = false;

  const content = bulkData.reduce((acc, cur, index) => {
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
