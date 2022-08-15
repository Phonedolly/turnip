const express = require('express')
const router = express.Router();
const crypto = require('crypto')
const { S3Client, DeleteObjectsCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const Post = require('../schemas/post');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')


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




// router.post('/login',
//     passport.authenticate('local', { failureRedireact: '/' }),
//     (req, res) => {
//         console.log("req.user : " + req.user)
//     });


router.get('/', (req, res) => {
    res.send({ test: 'hi' })
});


router.get('/getArtTitleList', async (req, res) => {
    Post.find({})
        .then((result) => {
            console.log('result: ' + result)
            res.send(result.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null, postURL: each.postURL })))
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

router.get('/post/:postURL', async (req, res) => {
    console.log(req.params.postURL)
    Post.find({ postURL: req.params.postURL })
        .then((result) => {
            res.send(result)
        }, (error) => {
            console.error(error)
            res.status(500).send();
        })
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
        postURL: req.body.title.replace(/ /gi, '-').replace(/\./gi, '').replace(/'/gi, ''),
        thumbnailURL: req.body.thumbnailURL ? req.body.thumbnailURL : null,
    })

    console.log(post);
    res.statusCode = 200;
    res.send();
})

const { verifyToken } = require('./jwt')
const User = require('../schemas/user');
const passport = require('../passport');

router.post('/createUser', async (req, res) => {
    passwordHashed = await createHashedPassword(req.body.password)
    User.create({ id: req.body.id, password: passwordHashed.password, salt: passwordHashed.salt })
        .then(result => {
            console.log("유저 생성 성공");
            console.log(result);
            res.send("sucesss")
        },
            (error) => {
                console.error("유저 생성 실패")
                console.error(error);
                res.send("error")
            })
})

const createSalt = () =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString('base64'));
        });
    });

const createHashedPassword = (plainPassword) =>
    new Promise(async (resolve, reject) => {
        const salt = await createSalt();
        crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve({ password: key.toString('base64'), salt });
        });
    });

module.exports = router;