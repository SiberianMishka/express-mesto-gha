const router = require('express').Router();
const {
  createUser,
  getUserById,
  getUsers,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

router.post('/', createUser);
router.get('/:userId', getUserById);
router.get('/', getUsers);
router.patch('/me', updateUserProfile);
router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
