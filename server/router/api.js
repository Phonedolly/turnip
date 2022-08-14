const express = require('express')
const router = express.Router();
const { S3Client, S3 } = require('@aws-sdk/client-s3')
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


router.post('/uploadImage', upload.single('img'), function (req, res, next) {
    res.json({ filelocation: req.file.location })
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