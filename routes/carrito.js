const express = require("express");
const { Router } = express;

const { carritosDao, carritosApi } = require("../src/daos/index");

const router = new Router();

router.get("/", async (req, res) => {
  res.json((await carritosApi.listarAll()).map((c) => c.id));
});

router.post("/", async (req, res) => {
  res.json(await carritosApi.guardar());
});

router.delete("/:id", async (req, res) => {
  res.json(await carritosApi.borrar(req.params.id));
});

//Router de productos en carrito

router.get("/:id/productos", async (req, res) => {
  const carrito = await carritosApi.listar(req.params.id);
  res.json(carrito.productos);
});

router.post("/:id/productos", async (req, res) => {
  const carrito = await carritosApi.listar(req.params.id);
  const producto = await productosApi.listar(req.body.id);
  carrito.productos.push(producto);
  await carritosApi.actualizar(carrito);
  res.end();
});

router.delete("/:id/productos/:idProd", async (req, res) => {
  const carrito = await carritosApi.listar(req.params.id);
  const index = carrito.productos.findIndex((p) => p.id == req.params.idProd);
  if (index != -1) {
    carrito.productos.splice(index, 1);
    await carritosApi.actualizar(carrito);
  }
  res.end();
});

module.exports = router;
