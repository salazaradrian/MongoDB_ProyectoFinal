const pacienteService = require('../services/pacienteService');

exports.getPacientes = async (req, res) => {
  try {
    const filtro = req.query.cedula ? { cedula: req.query.cedula } : {};
    const pacientes = await pacienteService.getAll(filtro);
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPacienteById = async (req, res) => {
  try {
    const paciente = await pacienteService.getById(req.params.id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPaciente = async (req, res) => {
  try {
    const nuevoPaciente = await pacienteService.create(req.body);
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePaciente = async (req, res) => {
  try {
    const pacienteActualizado = await pacienteService.update(req.params.id, req.body);
    if (!pacienteActualizado) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(pacienteActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePaciente = async (req, res) => {
  try {
    const pacienteEliminado = await pacienteService.remove(req.params.id);
    if (!pacienteEliminado) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
