const router = require('express').Router();
const {
  getCards,
  createCard,
  deleteCard,
  setCardLike,
  deleteCardLike,
} = require('../controllers/cards');
const { validateCardId, validateCardForm } = require('../middlewares/validation');

router.get('/', getCards);
router.post('/', validateCardForm, createCard);
router.delete('/:cardId', validateCardId, deleteCard);
router.put('/:cardId/likes', validateCardId, setCardLike);
router.delete('/:cardId/likes', validateCardId, deleteCardLike);

module.exports = router;
