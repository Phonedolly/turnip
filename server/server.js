const path = require('path')
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
// const passport = require('passport')
const express = require('express');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const cors = require('cors');

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


const api = require('./router/api');
// const post = require('./router/post')
const auth = require('./router/auth')

const connect = require('./schemas');
connect();

app.use(cookieParser(process.env.JWT_SECRET));
// passportConfig()

app.use(cors({ credentials: true }))
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false
  }
}));
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/api", api);
// app.use('/post', post)
app.use('/auth', auth)

app.get("*", (req, res) => {
  res.send(express.static(path.join(__dirname, '../client/bulid/index.html')))
})
const PORT = 5000;

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);

})

app.listen(PORT, () => console.log('server ready at ' + PORT));
