const path = require('path')
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const redis = require('redis')
const { S3Client, DeleteObjectsCommand } = require('@aws-sdk/client-s3')

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env.production') });
  console.log("MODE: PRODUCTION");
} else if (process.env.NODE_ENV === 'dev') {
  dotenv.config({ path: path.join(__dirname, '../.env.dev') });
  console.log("MODE: DEVELOPMENT");
} else {
  throw new Error('process.env.NDOE_ENV is not set');
}

const app = express();

/* initialize redis */
const redisClient = redis.createClient({
  host: process.env.REDIS_URL,
  port: 6379,
  password: process.env.REDIS_PASSWORD
});
(async () => {
  redisClient.connect();
})();

exports.redisClient = redisClient;

/* initialize client-s3 */
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION
});

exports.s3 = s3;



/* initialize routers*/
const api = require('./router/api');

/* initialize mongoose */
const connect = require('./schemas');
connect();

app.use(cookieParser(process.env.JWT_SECRET));

app.use(cors({ credentials: true }))
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", api);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})
const PORT = 5000;

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error)
})

app.use((err, req, res, next) => {
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500).send()

})

app.listen(PORT, () => console.log('server ready at ' + PORT));
