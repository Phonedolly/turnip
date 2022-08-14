const express = require('express')
const router = express.Router();
const { S3Client, DeleteObjectsCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const Post = require('../schemas/post');


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '_' + file.originalname)
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // acl: 'public-read'
    })
})

router.get('/', (req, res) => {
    res.send({ test: 'hi' })
});

router.delete('/deleteImage', (req, res) => {


})

router.get('/getArtTitleList', async (req, res) => {
    Post.find({})
        .then((result) => {
            console.log('result: ' + result)
            res.send(result.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null, link: each.link })))
        }, (err) => {
            console.error(err);
            console.error("get title error");
            res.statusCode = 500;
            res.statusMessage = "get title error";
            res.send();
        })
});

router.post('/uploadImage', upload.single('img'), function (req, res, next) {

    res.json({ imageLocation: req.file.location, imageName: req.file.key })
})


router.post('/publish', async (req, res) => {
    const isDuplicated = !!await Post.findOne({ title: req.body.title });
    if (isDuplicated) {
        console.error('duplicated title!')
        console.error('title:' + req.body.title)

        res.statusCode = 500;
        res.statusMessage = 'duplicated title';
        res.send({ isSuccessfullyPosted: false });
        return
    }
    console.log(11)
    console.log(req.body.blacklist)
    console.log(11)
    const params = {
        Bucket: process.env.S3_BUCKET,
        Delete: {
            Objects: req.body.blacklist
        },
        // Quiet: false
    }

    const deleteCommand = new DeleteObjectsCommand(params);
    console.log('222')
    s3.send(deleteCommand)
        .then((res) => {
            console.log('성공')
            console.log(res)
        }, (err) => {
            console.error('에러')
            console.error(err)
        })

    const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        postURL: req.body.title.replace(/ /gi, '-').replace(/\./gi, ''),
        thumbnailURL: req.body.thumbnailURL ? req.body.thumbnailURL : null,
    })

    console.log(post);
    res.statusCode = 200;
    res.send();
})

module.exports = router;