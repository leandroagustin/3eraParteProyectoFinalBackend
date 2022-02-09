const socket = io();

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

  return false;
};
