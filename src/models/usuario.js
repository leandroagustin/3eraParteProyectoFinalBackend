const mongoose = require("mongoose");

//Modelo de usuario Mongo Atlas
const usuariosCollection = "usuarios";

const usuariosSchema = new mongoose.Schema({
  username: String,
  password: String,
  nombre: String,
  direccion: String,
  edad: Number,
  telefono: String,
  foto: String,
});

const User = mongoose.model(usuariosCollection, usuariosSchema);

module.exports = User;
