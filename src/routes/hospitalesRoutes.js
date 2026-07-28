const express = require('express');
const router = express.Router();
const hospitalesController = require('../controllers/hospitalesController');

router.get('/', hospitalesController.getHospitales);
router.get('/:id', hospitalesController.getHospitalById);
router.post('/', hospitalesController.createHospital);
router.put('/:id', hospitalesController.updateHospital);
router.delete('/:id', hospitalesController.deleteHospital);

module.exports = router;
