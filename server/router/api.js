const express = require('express')
const router = express.Router();
const AWS = require('@aws-sdk/client-s3')
const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const multer = require('multer')
const multerS3 = require('multer-s3')
const Post = require('../schemas/post')

const s3Client = new S3Client();

const s3Params = {}


const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: 'stardue',
        key: function (req, file, cb) {
            console.log(req)
            let dir = req.body.dir;
            let datetime = Date.now()
            cb(null, dir + datetime + "_" + file.originalname);  // 저장되는 파일명
            console.log(13)
        },
    }),
})


router.get('/', (req, res) => {
    res.send({ test: 'hi' })
});

router.get('/getArtTitleList', async (req, res) => {
    Post.find({})
        .then((result) => {
            console.log('result: ' + result)
            res.send(result.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null })))
        }, (err) => {
            console.error(err);
            console.error("get title error");
            res.statusCode = 500;
            res.statusMessage = "get title error";
            res.send();
        })
});

router.post('/uploadImage', upload.single('file'), (req, res) => {
    console.log(req.file.location);
    res.json({ location: req.file.location })
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

    const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        thumbnailURL: req.body.thumbnailURL ? req.body.thumbnailURL : null
    })

    console.log(post);
    res.statusCode = 200;
    res.send();
})

module.exports = router;