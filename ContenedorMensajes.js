const { mensajes } = require("./db");

class Mensajes {
  constructor() {}
  async save(message) {
    await mensajes.create(message);
  }

  async getAll() {
    const message = await mensajes.find();
    return message;
  }

  async delete(id) {
    const message = await mensajes.deleteOne({
      _id: id,
    });
  }

  async deleteAll() {
    const message = await mensajes.deleteMany();
    return message;
  }
}

module.exports = Mensajes;
