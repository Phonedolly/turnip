const express = require('express')
const router = express.Router();
const Post = require('../schemas/post')

router.get('/', (req, res) => {
    res.send({ test: 'hi' })
});

router.get('/getArtTitleList', async (req, res) => {
    Post.find({})
        .then((result) => {
            console.log('result: ' + result)
            res.send(result.map((each) => each.title))
        }, (err) => {
            console.error(err);
            console.error("get title error");
            res.statusCode = 500;
            res.statusMessage = "get title error";
            res.send();
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

    const post = await Post.create({
        title: req.body.title,
        content: req.body.content
    })

    console.log(post);
    res.statusCode = 200;
    res.send();
})

module.exports = router;