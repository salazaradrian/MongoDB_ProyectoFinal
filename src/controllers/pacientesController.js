const Paciente = require('../models/Paciente');

exports.getPacientes = async (req, res) => {
  try {
    const filtro = req.query.cedula ? { cedula: req.query.cedula } : {};
    const pacientes = await Paciente.find(filtro);
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPaciente = async (req, res) => {
  try {
    const nuevoPaciente = new Paciente(req.body);
    await nuevoPaciente.save();
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaciente = async (req, res) => {
  try {
    const pacienteActualizado = await Paciente.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(pacienteActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};