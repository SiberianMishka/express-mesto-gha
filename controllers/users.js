const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const ConflictEmailError = require('../errors/conflict-email-err');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const checkUser = (user, res) => {
  if (user) {
    return res.send(user).status(200);
  }
  throw new NotFoundError('Пользователь не найден');
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      const newUser = user.toObject();
      delete newUser.password;
      res.send(newUser).status(201);
    })
    .catch((err) => {
      if (err.code === 11000) {
        const error = new ConflictEmailError('Пользователь с таким email уже существует');
        next(error);
        return;
      }
      if (err instanceof mongoose.Error.ValidationError) {
        const error = new BadRequestError('Переданы некорректные данные при создании пользователя');
        next(error);
        return;
      }
      next(err);
    });
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => checkUser(user, res))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        const error = new BadRequestError('Передан некорректный _id пользователя');
        next(error);
        return;
      }
      next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => checkUser(user, res))
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => checkUser(user, res))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        const error = new BadRequestError('Переданы некорректные данные при обновлении профиля');
        next(error);
        return;
      }
      next(err);
    });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => checkUser(user, res))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        const error = new BadRequestError('Переданы некорректные данные при обновлении аватара');
        next(error);
        return;
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => { // eslint-disable-line consistent-return
      if (!user) {
        return Promise.reject(new UnauthorizedError('Переданы неправильные email или пароль'));
      }
      bcrypt.compare(password, user.password)
        .then((matched) => { // eslint-disable-line consistent-return
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Переданы неправильные email или пароль'));
          }
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
            { expiresIn: '7d' },
          );
          res.send({ token });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  createUser,
  getUserById,
  getCurrentUser,
  getUsers,
  updateUserProfile,
  updateUserAvatar,
  login,
};
