const ContenedorMongoDb = require("../../contenedores/ContenedorMongoDb");

class ProductosDaoMongoDb extends ContenedorMongoDb {
  constructor() {
    super("productos", {
      title: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      thumbnail: {
        type: String,
        required: true,
      },
    });
  }
}

module.exports = ProductosDaoMongoDb;
