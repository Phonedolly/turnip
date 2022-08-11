const express = require('express');
const app = express();
const test = require('./router/test');

app.use("/api", test);

const PORT = 5000;

app.listen(PORT, () => console.log('server ready at ' + PORT));
