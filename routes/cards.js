const router = require('express').Router();
const {
  createCard,
  deleteCard,
  getCards,
  setCardLike,
  deleteCardLike,
} = require('../controllers/cards');

router.post('/', createCard);
router.delete('/:cardId', deleteCard);
router.get('/', getCards);
router.put('/:cardId/likes', setCardLike);
router.delete('/:cardId/likes', deleteCardLike);

module.exports = router;
