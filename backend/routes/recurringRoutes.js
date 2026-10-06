const express = require('express');
const router = express.Router();
const {
  getRecurring,
  createRecurring,
  updateRecurring,
  toggleRecurringStatus,
  processRecurring,
  deleteRecurring
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getRecurring).post(createRecurring);
router.route('/:id').put(updateRecurring).delete(deleteRecurring);
router.patch('/:id/toggle', toggleRecurringStatus);
router.post('/:id/process', processRecurring);

module.exports = router;
