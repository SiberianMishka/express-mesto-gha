const router = require('express').Router();
const {
  getUsers,
  getCurrentUser,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');
const { validateUserId, validateUserProfile, validateUserAvatar } = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', validateUserId, getUserById);
router.patch('/me', validateUserProfile, updateUserProfile);
router.patch('/me/avatar', validateUserAvatar, updateUserAvatar);

module.exports = router;
