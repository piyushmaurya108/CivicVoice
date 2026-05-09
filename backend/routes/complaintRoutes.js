const express = require('express');
const upload = require('../middleware/upload');
const {
  submitComplaint,
  getComplaints,
  getStats,
  getNearbyComplaints,
  getComplaintById
} = require('../controllers/complaintController');

const router = express.Router();

// Specific paths must come before parametric /:id
router.get('/stats', getStats);
router.get('/nearby', getNearbyComplaints);

router.get('/', getComplaints);
router.post('/', upload.single('image'), submitComplaint);

router.get('/:id', getComplaintById);

module.exports = router;
