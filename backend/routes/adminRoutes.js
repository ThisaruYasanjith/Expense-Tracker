const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
