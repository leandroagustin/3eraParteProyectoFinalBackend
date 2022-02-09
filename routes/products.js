const router = require("express").Router();
const faker = require("faker");
const knex = require("../db");
// const fs = require("fs");

let arrInfo = [];

// fs.writeFile("../dataMosk.json", JSON.stringify(arrInfo, null, 2), () => {
//   console.log("Archivo creado!");
// });

//Faker
const createMocks = (cant = 5) => {
  for (let i = 0; i < cant; i++) {
    arrInfo.push({
      nombre: faker.name.firstName(),
      precio: faker.finance.amount(),
      foto: faker.image.food(),
    });
  }
  return arrInfo;
};

//Faker
router.get("/api/productos-test", (req, res) => {
  res.send(createMocks());
});

//Mostrar todos los productos
router.get("/", (req, res) => {
  knex
    .from("products")
    .then((data) => {
      res.json({ data: data });
    })
    .catch((err) => {
      res.send("Error al mostrar productos!");
    });
});
//Mostrar por id
router.get("/:id", (req, res) => {
  let { id } = req.params;
  knex
    .from("products")
    .select("title", "price") //Solo muestra el title y el price del id.
    .where({ id: id })
    .then((json) => {
      res.send({ data: json });
    })
    .catch(() => {
      res.send("Error al buscar usuario");
    });
});
router.post("/", (req, res) => {
  let data = {
    title: req.body.title,
    price: req.body.price,
    thumbnail: req.body.thumbnail,
  };
  knex("products")
    .insert(data)
    .then(res.send("Producto guardado correctamente!"))
    .catch((err) => {
      res.send("Error al guardar producto");
    });
});
//Actualizar
router.put("/update/:id", (req, res) => {
  knex("products")
    .where({ id: req.params.id })
    .update({
      title: req.body.title,
      price: req.body.title,
    })
    .then((json) => {
      res.send({ data: json });
    })
    .catch(() => {
      res.send("Error al actualizar producto!");
    });
});
//Eliminar
router.delete("/delete/:id", (req, res) => {
  knex("products")
    .where({ id: req.params.id })
    .del()
    .then((json) => {
      res.send({ data: `Usuario: ${id} eliminado!` });
    })
    .catch((err) => {
      res.send("Error al eliminar");
    });
});
module.exports = router;
