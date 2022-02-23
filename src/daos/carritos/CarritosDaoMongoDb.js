const ContenedorMongoDb = require("../../contenedores/ContenedorMongoDB");

class CarritosDaoMongoDb extends ContenedorMongoDb {
  constructor() {
    super("carritos", {
      productos: { type: [], required: true },
    });
  }

  async guardar(carrito = { productos: [] }) {
    return super.guardar(carrito);
  }
  //
  async update(carrito, producto) {
    const products = await this.coleccion.findOneAndUpdate(
      { _id: carrito },
      { product: producto }
    );
    return products;
  }

  async getById(id) {
    let carrito = await this.coleccion.findById({ _id: id });
    return carrito;
  }

  async getProducts(id) {
    const carrito = await this.getById(id);
    return carrito.product;
  }

  async deleteProduct(id, idProduct) {
    const carrito = await this.getById(id);
    const index = carrito.product.findIndex(
      (pr) => JSON.stringify(pr._id) == idProduct
    );
    if (index != -1) {
      carrito.product.splice(index, 1);
      this.update(id, carrito);
    }
    return carrito;
  }
}

module.exports = CarritosDaoMongoDb;
