const mongoose = require('mongoose');
const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        const error = new BadRequestError('Переданы некорректные данные при создании карточки');
        next(error);
        return;
      }
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  Card.findById(id)
    .then((cardFound) => {
      if (!cardFound) {
        const err = new NotFoundError('Передан некорректный _id карточки');
        next(err);
        return;
      }
      const ownerId = cardFound.owner.toString();
      if (userId === ownerId) {
        cardFound.deleteOne()
          .then((card) => res.send(card))
          .catch((err) => next(err));
      } else {
        const err = new ForbiddenError('Нельзя удалить карточку другого пользователя');
        next(err);
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        const error = new NotFoundError('Переданы некорректные данные при удалении карточки');
        next(error);
        return;
      }
      next(err);
    });
};

const setCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).populate(['owner'])
    .then((card) => {
      if (card) {
        res.send(card);
        return;
      }
      throw new NotFoundError('Передан несуществующий _id карточки');
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        const error = new BadRequestError('Переданы некорректные данные для постановки лайка');
        next(error);
        return;
      }
      next(err);
    });
};

const deleteCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).populate(['owner'])
    .then((card) => {
      if (card) {
        res.send(card);
        return;
      }
      throw new NotFoundError('Передан несуществующий _id карточки');
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        const error = new BadRequestError('Переданы некорректные данные для снятии лайка');
        next(error);
        return;
      }
      next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  setCardLike,
  deleteCardLike,
};
