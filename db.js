const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

mongoose.connect(
  "mongodb+srv://Leandro:123@clusterdemo.eullt.mongodb.net/test"
);

mongoose.connection.on("open", () => {
  console.log("Base de datos conectada con exito");
});

mongoose.connection.on("error", () => {
  console.log("Error al conectarse a la base de datos");
});

const messageSchema = new Schema({
  author: {
    id: String,
    nombre: String,
    apellido: String,
    edad: Number,
    alias: String,
    avatar: String,
  },

  text: { type: String, required: true },
});

const mensajes = model("message", messageSchema);
//

const usersSchema = new Schema({
  username: String,
  password: String,
  email: String,
  firstName: String,
  edad: Number,
  telefono: String,
  foto: String,
});

const User = model("user", usersSchema);

module.exports = { mensajes, User };
