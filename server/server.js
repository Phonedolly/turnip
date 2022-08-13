const path = require('path')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.join(__dirname, '../.env.production') });
    console.log("MODE: PRODUCTION");
} else if (process.env.NODE_ENV === 'dev') {
    dotenv.config({ path: path.join(__dirname, '../.env.dev') });
    console.log("MODE: DEVELOPMENT");
} else {
    throw new Error('process.env.NDOE_ENV is not set');
}

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const api = require('./router/api');

const connect = require('./schemas');
connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", api);
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
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
