const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3')

const { s3 } = require('../server')
const { redisClient } = require('../server')

const Post = require('../schemas/post');
const sitemapCacheUpdator = require('../tools/sitemapCacheUpdator')

const router = express.Router();


const getToday = () => {
  var date = new Date();
  var year = date.getFullYear();
  var month = ("0" + (1 + date.getMonth())).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
}
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, getToday() + "/" + Date.now().toString() + '_' + req.body.filename)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,

    // acl: 'public-read'
  })
})

const isPostExists = async (req, res, next) => {
  req.isPostExists = !!await Post.findOne({ title: req.body.title })
  next()
}

router.post('/uploadImage', upload.single('img'), function (req, res, next) {
  console.log(req.body)
  res.json({ imageLocation: req.file.location, imageName: req.file.key })
})

const titleLinkManufacturer = (req, res, next) => {
  try {
    if (req.body.newTitle) {
      req.body.postURL = req.body.newTitle.replace(/ /gi, '-').replace(/\./gi, '').replace(/,/gi, '').replace(/'/gi, '').replace(/“/gi, '"').replace(/”/gi, '"').replace(/‘/gi, "'").replace(/’/gi, "'")

    } else {
      req.body.postURL = req.body.title.replace(/ /gi, '-').replace(/\./gi, '').replace(/,/gi, '').replace(/'/gi, '').replace(/“/gi, '"').replace(/”/gi, '"').replace(/‘/gi, "'").replace(/’/gi, "'")
    }
    next()
  } catch (error) {
    console.log("Title has a problem")
    console.error(error)
    res.status(500).send("Title has a problem")
  }
}

const deleteBlacklist = async (imageBlacklist) => {

  if (imageBlacklist.length === 0) {
    return
  }
  console.log(imageBlacklist)
  console.log(11)
  const params = {
    Bucket: process.env.S3_BUCKET,
    Delete: {
      Objects: imageBlacklist
    },
    // Quiet: false
  }

  const deleteCommand = new DeleteObjectsCommand(params);
  console.log('222')
  console.log(imageBlacklist)
  await s3.send(deleteCommand)
    .then((res) => {
      console.log('성공')
      console.log(res)
    }, (err) => {
      console.error('에러')
      console.error(err)

    })
}

const updatePostToCache = (post) => {
  redisClient.set(post.postURL, JSON.stringify(post))
}

router.post('/edit', isPostExists, titleLinkManufacturer, async (req, res) => {
  if (!req.isPostExists) {
    return res.status(500).send("post not exists")
  }
  const post = await Post.updateOne(
    { _id: req.body._id }, {

    title: req.body.newTitle,
    content: req.body.content,
    postURL: req.body.postURL,
    images: req.body.imageWhitelist,
    thumbnailURL: req.body.thumbnailURL ?? null,

  }).then(async () => updatePostToCache(await Post.findOne({ postURL: req.body.postURL })))
  deleteBlacklist(req.body.imageBlacklist)

  res.status(200).send(post);
})

router.post('/', isPostExists, titleLinkManufacturer, async (req, res) => {
  const isDuplicated = req.isPostExists;
  if (isDuplicated) {
    console.error('duplicated title!')
    console.error('title:' + req.body.title)
    res.status(500).send('duplicated title');
    return
  }

  deleteBlacklist(req.body.imageBlacklist)
    .then(() => console.log("이미지 삭제 성공"),
      (err) => {
        console.log("이미지 삭제 실패")
        return res.status(500).send(err)
      })

  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    postURL: req.body.postURL,
    images: req.body.imageWhitelist,
    thumbnailURL: req.body.thumbnailURL ? req.body.thumbnailURL : null,
  }).then((post) => {
    updatePostToCache(post);
    sitemapCacheUpdator(true);
  })

  console.log(post);
  res.status(200).send();
})

module.exports = router;
