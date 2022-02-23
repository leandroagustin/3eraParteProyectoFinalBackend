const socket = io();

const transporter = require("../src/mailer/mailer");
//twilio
const client = require("../src/whatsapp/whatsapp");
const dotenv = require("dotenv");
dotenv.config();

const TEST_MAIL = "francisca.moen70@ethereal.email";

//Normalize
const authorSchema = new normalizr.schema.Entity(
  "author",
  {},
  { idAttribute: "id" }
);

const messageSchema = new normalizr.schema.Entity(
  "text",
  {
    author: authorSchema,
  },
  { idAttribute: "id" }
);

const messagesSchema = new normalizr.schema.Entity(
  "posts",
  { mensaje: [messageSchema] },
  { idAttribute: "id" }
);

function modificarData(data) {
  const newData = { id: "message", posts: data };
  return newData;
}

socket.on("message_msn", (data) => {
  const newData = normalizr.denormalize(
    data.result,
    messageSchema,
    data.entities
  );

  let html = data.entities.posts.message.posts
    .map((x) => {
      //cambiar tipos y colores
      return `<p> <strong style="color: ">${x.author.alias}: </strong>  ${x.text} </p>`;
    })
    .join(" ");

  document.querySelector("#mensajes").innerHTML = html;
});

socket.on("message_pr", (dataObj) => {
  updateTable(dataObj);
});

const render = (data) => {
  const newData = normalizr.denormalize(data, messageSchema, data.entities);

  console.log(newData);
  let html = newData
    .map((x) => {
      console.log(x.undefined.author.alias);
    })
    .join(" ");

  document.querySelector("#mensajes").innerHTML = html;
};

const addMessage = () => {
  let dataObj = {
    author: {
      id: document.querySelector("#email").value,
      nombre: document.querySelector("#nombre").value,
      apellido: document.querySelector("#apellido").value,
      edad: document.querySelector("#edad").value,
      alias: document.querySelector("#alias").value,
      avatar: document.querySelector("#avatar").value,
    },
    text: document.querySelector("#mensaje").value,
  };

  let data = modificarData(dataObj);
  socket.emit("dataText", normalizr.normalize(data, messagesSchema));
  document.querySelector("#mensaje").value = "";
  return false;
};

// Products Render
const updateTable = (data) => {
  let html = data
    .map((x) => {
      return `<tr>
                    <td>${x.title}</td>
                    <td>${x.price}</td>
                    <td>
                        <img src=${x.thumbnail} alt="foto del prod" class="ml-0" height="60px"/>
                    </td>
                </tr>`;
    })
    .join(" ");
  document.querySelector("#tableProds").innerHTML = html;
};

// Products Server

const addPr = () => {
  let dataObj = {
    title: document.querySelector("#title").value,
    price: document.querySelector("#price").value,
    thumbnail: document.querySelector("#thumbnail").value,
  };
  socket.emit("newProd", dataObj);
  document.querySelector("#title").value = "";
  document.querySelector("#price").value = "";
  document.querySelector("#thumbnail").value = "";

  try {
    let info = transporter.sendMail({
      from: "Servidor node.js",
      to: TEST_MAIL,
      subject: "Una nueva compra",
      html: `<h1> Pedido </h1>  ${dataObj.map((pr) => {
        `
        Articulo: ${pr.title} \n
        Precio: ${pr.price} \n
        Codigo: ${pr.thumbnail} \n
        `;
      })}`,
    });

    let whatsapp = client.messages.create({
      body: `<h1> Pedido </h1>  ${dataObj.map((pr) => {
        `
        Articulo: ${pr.title} \n
        Precio: ${pr.price} \n
        Codigo: ${pr.thumbnail} \n
        `;
      })}`,
      from: "whatsapp:+18606891892", //de twilio
      to: "whatsapp:+5492804568365", //+549..
    });
    // //console.log(products.product.length);
    // for (let i = 0; i < products.product.length; i++) {
    //   let res = cart.deleteProduct(
    //     req.params.id,
    //     JSON.stringify(products.product[i]._id)
    //   );
    // }
  } catch (err) {
    warningLogger.error(err);
  }

  return false;
};
