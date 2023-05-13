const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const { NOT_FOUND } = require('../utils/response-codes');

router.use('/users', userRouter);
router.use('/cards', cardRouter);
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Передан несуществующий запрос' });
});

module.exports = router;
