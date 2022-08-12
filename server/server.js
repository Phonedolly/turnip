const path = require('path')
const express = require('express');

const app = express();
const test = require('./router/test');

const connect = require('./schemas')

app.use("/api", test);
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
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
    res.render('error')
})

app.listen(PORT, () => console.log('server ready at ' + PORT));
