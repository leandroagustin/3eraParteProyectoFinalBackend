const express = require("express");
const { Router } = express;

// import { productosDao as productosApi } from "../src/daos/index.js";

const { productosDao, productosApi } = require("../src/daos/index");

//Permisos de admin
const esAdmin = true;

function crearErrorNoEsAdmin(ruta, metodo) {
  const error = {
    error: -1,
  };
  if (ruta && metodo) {
    error.descripcion = `Ruta '${ruta}' metodo '${metodo}' no autorizado`;
  } else {
    error.descripcion = "No autorizado";
  }
  return error;
}

function soloAdmins(req, res, next) {
  if (!esAdmin) {
    res.json(crearErrorNoEsAdmin());
  } else {
    next();
  }
}

//Configuracion router de productos
const router = new Router();

router.get("/", async (req, res) => {
  const productos = await productosApi.listarAll();
  res.json(productos);
});

router.get("/:id", async (req, res) => {
  res.json(await productosApi.listar(req.params.id));
});

router.post("/", soloAdmins, async (req, res) => {
  res.json(await productosApi.guardar(req.body));
});

router.put("/:id", soloAdmins, async (req, res) => {
  res.json(await productosApi.actualizar(req.body));
});

router.delete("/:id", soloAdmins, async (req, res) => {
  res.json(await productosApi.borrar(req.params.id));
});

module.exports = router;
