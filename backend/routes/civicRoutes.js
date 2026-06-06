const express = require('express');
const {
  getRepresentativesRoute,
  getOrganisationsRoute
} = require('../controllers/civicController');

const router = express.Router();

router.get('/representatives', getRepresentativesRoute);
router.get('/organisations', getOrganisationsRoute);

module.exports = router;
