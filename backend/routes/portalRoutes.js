const express = require('express');
const { getPortal } = require('../controllers/portalController');

const router = express.Router();

router.get('/', getPortal);

module.exports = router;
