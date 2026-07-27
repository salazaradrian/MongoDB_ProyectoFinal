const express = require('express');
const router = express.Router();
const hospitalesController = require('../controllers/hospitalesController');

router.get('/', hospitalesController.getHospitales);
router.post('/', hospitalesController.createHospital);

module.exports = router;