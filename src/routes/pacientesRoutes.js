const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');

router.get('/', pacientesController.getPacientes);
router.post('/', pacientesController.createPaciente);
router.put('/:id', pacientesController.updatePaciente);

module.exports = router;