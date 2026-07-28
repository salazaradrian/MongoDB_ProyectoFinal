const Paciente = require('../models/Paciente');

class PacienteService {
  async getAll(filtro = {}) {
    return Paciente.find(filtro);
  }

  async getById(id) {
    return Paciente.findById(id);
  }

  async create(data) {
    const paciente = new Paciente(data);
    return paciente.save();
  }

  async update(id, data) {
    return Paciente.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async remove(id) {
    return Paciente.findByIdAndDelete(id);
  }
}

module.exports = new PacienteService();
