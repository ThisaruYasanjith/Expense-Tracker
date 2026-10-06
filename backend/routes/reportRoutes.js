const express = require('express');
const router = express.Router();
const {
  exportCSV,
  getStatementData
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/export-csv', exportCSV);
router.get('/statement', getStatementData);

module.exports = router;
