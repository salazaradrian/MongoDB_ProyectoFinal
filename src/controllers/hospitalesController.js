const hospitalService = require('../services/hospitalService');

exports.getHospitales = async (req, res) => {
  try {
    const hospitales = await hospitalService.getAll();
    res.json(hospitales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await hospitalService.getById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital no encontrado' });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const nuevoHospital = await hospitalService.create(req.body);
    res.status(201).json(nuevoHospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const hospitalActualizado = await hospitalService.update(req.params.id, req.body);
    if (!hospitalActualizado) {
      return res.status(404).json({ error: 'Hospital no encontrado' });
    }
    res.json(hospitalActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    const hospitalEliminado = await hospitalService.remove(req.params.id);
    if (!hospitalEliminado) {
      return res.status(404).json({ error: 'Hospital no encontrado' });
    }
    res.json({ message: 'Hospital eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
