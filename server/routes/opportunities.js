const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOpportunities, getOpportunity, createOpportunity, updateOpportunity,
  deleteOpportunity, applyToOpportunity, getMyApplications, getApplicants,
  updateApplicantStatus, getMatchedOpportunities, saveOpportunity, getMyPosts
} = require('../controllers/opportunityController');

// Public routes
router.get('/', getOpportunities);

// Protected routes
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/matched', protect, authorize('student'), getMatchedOpportunities);
router.get('/my-posts', protect, authorize('organization'), getMyPosts);
router.post('/', protect, authorize('organization'), createOpportunity);

router.get('/:id', getOpportunity);
router.put('/:id', protect, authorize('organization'), updateOpportunity);
router.delete('/:id', protect, authorize('organization'), deleteOpportunity);
router.post('/:id/apply', protect, authorize('student'), applyToOpportunity);
router.post('/:id/save', protect, authorize('student'), saveOpportunity);
router.get('/:id/applicants', protect, authorize('organization'), getApplicants);
router.put('/:id/applicants/:studentId', protect, authorize('organization'), updateApplicantStatus);

module.exports = router;
