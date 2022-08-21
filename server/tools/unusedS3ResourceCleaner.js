const { s3 } = require('../server')

const Post = require('../schemas/post');

const runner = () => {
  const blacklist = []

  Post.find({})
    .then((res) => {

    })

  console.log("S3 Image Clean Up Complete")
}

const unusedS3ResourceCleaner = () => {
  setInterval(runner, process.env.S3_CLEAN_TIME)
}