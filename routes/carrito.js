const express = require("express");
const { Router } = express;

const { warningLogger } = require("../src/loggers/loggers");

const { carritosApi } = require("../src/daos/index").carritosDao;

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

const transporter = require("../src/mailer/mailer");
//twilio
const client = require("../src/whatsapp/whatsapp");
const dotenv = require("dotenv");
dotenv.config();

const TEST_MAIL = "francisca.moen70@ethereal.email";

router.get("/comprar/:id", async (req, res) => {
  let products = await carritos.getById(req.params.id);
  await products.populate({
    path: "product",
    model: "Product",
  });
  if (!products.product) {
    res.json({ err: `Carrito vacio` });
  }

  try {
    let info = await transporter.sendMail({
      from: "Servidor node.js",
      to: TEST_MAIL,
      subject: "Una nueva compra",
      html: `<h1> Pedido </h1>  ${products.product.map((pr) => {
        `
        Articulo: ${pr.nombre} \n
        Precio: ${pr.precio} \n
        Codigo: ${pr.codigo} \n
        `;
      })}`,
    });

    let whatsapp = await client.messages.create({
      body: `<h1> Pedido </h1>  ${products.product.map((pr) => {
        `
        Articulo: ${pr.nombre} \n
        Precio: ${pr.precio} \n
        Codigo: ${pr.codigo} \n
        `;
      })}`,
      from: "whatsapp:+18606891892", //de twilio
      to: "whatsapp:+5492804568365", //+549..
    });
    //console.log(products.product.length);
    for (let i = 0; i < products.product.length; i++) {
      let res = await carritos.deleteProduct(
        req.params.id,
        JSON.stringify(products.product[i]._id)
      );
    }
  } catch (err) {
    warningLogger.error(err);
  }

  res.json({ products: products.product });
});

module.exports = router;
