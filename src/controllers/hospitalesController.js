const Hospital = require('../models/Hospital');

exports.getHospitales = async (req, res) => {
  try {
    const hospitales = await Hospital.find();
    res.json(hospitales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const nuevoHospital = new Hospital(req.body);
    await nuevoHospital.save();
    res.status(201).json(nuevoHospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};