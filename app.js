require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const { handleErrors, validateSignUp, validateSignIn } = require('./middlewares/errors');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./errors/not-found-err');
const auth = require('./middlewares/auth');

const router = require('./routes/index');

// const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT, BASE_PATH } = process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.',
});

mongoose
  .connect(
    BASE_PATH,
    { useNewUrlParser: true },
  )
  .then(() => console.log(`Connected to DB: ${BASE_PATH}`)) // eslint-disable-line no-console
  .catch((err) => console.log(err)); // eslint-disable-line no-console

app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signup', validateSignUp, createUser);
app.post('/signin', validateSignIn, login);

app.use(auth);

// подключить логгер запросов до обработчиков всех роутов
// app.use(requestLogger);

app.use(router);

// подключить логгер ошибок после обработчиков роутов и до обработчиков ошибок
// app.use(errorLogger);

app.use((req, res, next) => {
  const err = new NotFoundError('Страница не найдена');
  next(err);
});

app.use(errors());
app.use(handleErrors);

// app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`); // eslint-disable-line no-console
});
