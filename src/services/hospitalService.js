const Hospital = require('../models/Hospital');

class HospitalService {
  async getAll() {
    return Hospital.find();
  }

  async getById(id) {
    return Hospital.findById(id);
  }

  async create(data) {
    const hospital = new Hospital(data);
    return hospital.save();
  }

  async update(id, data) {
    return Hospital.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async remove(id) {
    return Hospital.findByIdAndDelete(id);
  }
}

module.exports = new HospitalService();
