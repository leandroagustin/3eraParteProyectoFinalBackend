let productosDao;
let carritosDao;
let usuarioDao;

let mongoAtlas = "mongoAtlas";
// let json = "json";

switch (mongoAtlas) {
  case "mongoAtlas":
    const ProductosDaoMongoDb = require("./productos/ProductosDaoMongoDb");
    const CarritosDaoMongoDb = require("./carritos/CarritosDaoMongoDb");
    const UsuarioMongo = require("./usuarios/usuariosDaosMongo");

    productosDao = new ProductosDaoMongoDb();
    carritosDao = new CarritosDaoMongoDb();
    usuarioDao = new UsuarioMongo();
    break;

  default:
    "json";
    const ProductosDaoArchivo = require("./productos/ProductosDaoArchivo");
    const CarritosDaoArchivo = require("./productos/ProductosDaoMongoDb");

    productosDao = new ProductosDaoArchivo();
    carritosDao = new CarritosDaoArchivo();
    break;
}

module.exports = { productosDao, carritosDao, usuarioDao, mongoAtlas };
