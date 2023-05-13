// const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes');

const { PORT = 3000, BASE_PATH = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

mongoose.connect(BASE_PATH, {});

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '645a2991da842789febdc5ab',
  };

  next();
});

app.use(router);

// app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
