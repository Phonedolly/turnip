const path = require('path')
const express = require('express');

const app = express();
const test = require('./router/test');

app.use("/api", test);
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})
const PORT = 5000;

app.listen(PORT, () => console.log('server ready at ' + PORT));
