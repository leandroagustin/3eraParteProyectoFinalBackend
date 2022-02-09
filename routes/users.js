const express = require("express");
const knex = require("../db");
const { Router } = express;
const router = new Router();

router.get("/", (req, res) => {
  knex
    .from("users")
    .select("id", "email", "text")
    .then((json) => {
      console.log(json);
      res.send({ data: json });
    })
    .catch((err) => {
      res.send("Usuarios no encontrados");
    });
});

router.get("/:id", (req, res) => {
  knex
    .from("users")
    .where({ id: req.params.id })
    .then((response) => {
      res.json({ data: response });
    })
    .catch((err) => {
      res.send("Error al buscar usuario");
    });
});

router.post("/", (req, res) => {
  let data = {
    text: req.body.text,
    email: req.body.email,
  };
  knex("users")
    .insert(data)
    .then(() => {
      res.send("Nuevo mensaje de un nuevo integrante del chat!");
    })
    .catch((err) => {
      res.send("Error al enviar mensaje");
    });
});

router.put("/update/:id", (req, res) => {
  knex("users")
    .where({ id: req.params.id })
    .update({ text: req.body.text }) // solo actualizo los valores que me interesa.
    .then((json) => {
      res.json({ data: json });
    })
    .catch((err) => {
      res.send("Error al editar mensaje");
    });
});

router.delete("/delete/:id", (req, res) => {
  knex("users")
    .where({ id: req.params.id })
    .del()
    .then((json) => {
      res.json({ data: "Mensaje eliminado!" });
    })
    .catch((err) => {
      res.send("Error al eliminar mensaje");
    });
});

module.exports = router;
