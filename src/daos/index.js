let productosDao;
let carritosDao;

let mongoAtlas = "mongoAtlas";
// let json = "json";

switch (mongoAtlas) {
  case "mongoAtlas":
    const ProductosDaoMongoDb = require("./productos/ProductosDaoMongoDb.js");
    const CarritosDaoMongoDb = require("./carritos/CarritosDaoMongoDb.js");

    productosDao = new ProductosDaoMongoDb();
    carritosDao = new CarritosDaoMongoDb();
    break;

  default:
    "json";
    const ProductosDaoArchivo = require("./productos/ProductosDaoArchivo.js");
    const CarritosDaoArchivo = require("./productos/ProductosDaoMongoDb.js");

    productosDao = new ProductosDaoArchivo();
    carritosDao = new CarritosDaoArchivo();
    break;
}

module.exports = { productosDao, carritosDao, mongoAtlas };
