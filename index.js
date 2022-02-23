const express = require("express");
const port = process.env.PORT || 8080;
const http = require("http");
//Multer
// const multer = require("multer");
// const update = multer({ dest: "public/images" })
const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, `/public/images`));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let update = multer({ storage });

const Mensajes = require("./ContenedorMensajes");
const msj = new Mensajes();
const { normalize, denormalize, schema } = require("normalizr");
// const util = require("util");
const { User } = require("./db");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bCrypt = require("bcrypt");

const productsRoutes = require("./routes/products"); //con knex no funca
const usersRoutes = require("./routes/users"); //con knex no funca
//
const carritosRouter = require("./routes/carrito");
const productosRouter = require("./routes/productos");

// const authWebRouter = require("./routes/auth");
// const path = require("path");

const passport = require("passport");

// const parseArg = require("minimist");

const dotenv = require("dotenv");
const random = require("./routes/randoms");

//Loggers
const { infoLogger, warningLogger } = require("./src/loggers/loggers");

const client = require("./src/whatsapp/whatsapp");
const transporter = require("./src/mailer/mailer");
const TEST_MAIL = "francisca.moen70@ethereal.email";

const cluster = require("cluster");
const numCPUS = require("os").cpus().length; //cpus() me devuelve un array con la contidad de nucleos [1,2,3,4,5,6,7]

if (cluster.isMaster) {
  for (let i = 0; i < numCPUS; i++) {
    //worker
    cluster.fork(); //creo un proceso para cada nucleo
  }
  cluster.on("exit", () => {
    infoLogger.info(`Process ${process.pid} died`);
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = require("socket.io")(server);

  app.use("/products", productsRoutes);
  app.use("/users", usersRoutes);
  //
  app.use("/carritos", carritosRouter);
  app.use("/productos", productosRouter);
  // app.use(authWebRouter);

  app.use(
    session({
      store: MongoStore.create({
        mongoUrl:
          "mongodb+srv://Leandro:123@clusterdemo.eullt.mongodb.net/test",
      }),
      // store: MongoStore.create({ mongoUrl: config.mongoRemote.cnxStr }),
      secret: "shhh!",
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: 60000,
      },
    })
  );

  // function print(objeto) {
  //   console.log(util.inspect(objeto, false, 12, true));
  // }

  //Normalizr
  const authorSchema = new schema.Entity("author", {}, { idAttribute: "id" });

  const messageSchema = new schema.Entity(
    "text",
    { author: authorSchema },
    { idAttribute: "id" }
  );

  const messagesSchema = new schema.Entity(
    "posts",
    { text: [messageSchema] },
    { idAttribute: "id" }
  );

  function modificarData(data) {
    const newData = { id: "message", posts: data };
    return newData;
  }

  app.use(passport.initialize());
  app.use(passport.session());

  io.on("connection", async (socket) => {
    const data = await msj.getAll();

    const normalizeMessage = normalize(modificarData(data), messagesSchema);
    const deNormalizeData = denormalize(
      normalizeMessage.result,
      messagesSchema,
      normalizeMessage.entities
    );

    socket.emit("message_msn", normalizeMessage);

    socket.on("dataText", async (dataObj) => {
      let newData = denormalize(
        dataObj.result,
        messagesSchema,
        dataObj.entities
      );
      await msj.save(newData.posts);

      io.sockets.emit("message_msn", normalizeMessage);
    });

    socket.emit("message_pr", await getAll());

    //Creo nuevo producto
    socket.on("newProd", async (dataObj) => {
      await save(dataObj);
      console.log(`Producto guardado!`);
      io.sockets.emit("message_pr", await getAll());
    });
  });

  //////////////////////////////////////////////////
  const { engine } = require("express-handlebars");

  app.use(express.json());
  app.use(express.static(__dirname + "/views"));
  app.use(express.urlencoded({ extended: true }));

  app.engine(".hbs", engine({ extname: ".hbs", defaultLayout: "main.hbs" }));
  app.set("view engine", ".hbs");

  const LocalStrategy = require("passport-local").Strategy;

  function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
  }

  function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  }

  dotenv.config();

  app.use("/api/randoms", random);

  app.get("/info", (req, res) => {
    res.render(path.join(process.cwd()), "./api/info", {
      argumentos: parseArg(process.argv.slice(2)),
      plataforma: process.platform,
      version: process.version,
      memoria: process.memoryUsage().rss,
      pathEjecucion: process.execPath,
      processId: process.pid,
      carpeta: process.cwd(),
    });
    console.log(
      `argumentos: ${parseArg(process.argv.slice(2))} \n plataforma: ${
        process.platform
      } \n version: ${process.version} \n memoria: ${
        process.memoryUsage().rss
      } \n pathEjecucion: ${process.execPath} \n processId: ${
        process.pid
      } \n carpeta: ${process.cwd()}`
    );
    loggerInfo.info(`URL: ${req.url} Metodo: ${req.method}`);
  });

  app.get("/info2", (req, res) => {
    res.render(path.join(process.cwd()), "./api/info2", {
      argumentos: parseArg(process.argv.slice(2)),
      plataforma: process.platform,
      version: process.version,
      memoria: process.memoryUsage().rss,
      pathEjecucion: process.execPath,
      processId: process.pid,
      carpeta: process.cwd(),
    });
    loggerInfo.info(`URL: ${req.url} Metodo: ${req.method}`);
  });

  passport.use(
    "signup",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        User.findOne({ username: username }, function (err, user) {
          if (err) {
            warningLogger.error("Error in SignUp: " + err);
            return done(err);
          }

          if (user) {
            console.log("User already exists");
            return done(null, false);
          }

          const foto = `${req.file.destination}/${req.file.filename}`;

          const newUser = {
            username: username,
            password: createHash(password),
            foto: foto,
          };

          User.create(newUser, async (err, userWithId) => {
            if (err) {
              warningLogger.error("Error in Saving user: " + err);
              return done(err);
            }
            console.log(user);
            console.log("User Registration succesful");
            return done(null, userWithId);
          });

          let info = transporter.sendMail({
            from: "Servidor node.js",
            to: TEST_MAIL,
            subject: "Nuevo registro",
            html: `<h1> Nuevo usuario registrado </h1> \n 
              <span>Nombre: ${username} </span>\n
              <span>Foto: ${foto}</span>`,
          });
          infoLogger.info(info);

          let whatsapp = client.messages.create({
            body: `<h1> Nuevo usuario registrado </h1> \n 
              <span>Nombre: ${username} </span>\n
              <span>Foto: ${foto}</span>`,
            from: "whatsapp:+18606891892",
            to: "whatsapp:+542804568365",
          });
          infoLogger.info(whatsapp);
        });
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) return done(err);

        if (!user) {
          console.log("User Not Found with username " + username);
          return done(null, false);
        }

        if (!isValidPassword(user, password)) {
          console.log("Invalid Password");
          return done(null, false);
        }

        return done(null, user);
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, done);
  });

  //  LOGIN
  app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
      var user = req.user;
      console.log("user logueado");
      res.render("login-ok", {
        usuario: user.username,
        nombre: user.firstName,
        apellido: user.lastName,
        email: user.email,
        foto: user.foto,
      });
    } else {
      console.log("user NO logueado");
      res.sendFile(__dirname + "/views/login.html");
    }
  });
  app.post(
    "/login",
    passport.authenticate("login", { failureRedirect: "/faillogin" }),
    (req, res) => {
      let user = req.user;
      infoLogger.info(user);

      //grabo en user fecha y hora logueo
      res.sendFile(__dirname + "/views/index.html");
    }
  );
  app.get("/faillogin", (req, res) => {
    warningLogger.error("error en login");
    res.render("login-error", {});
  });

  //  SIGNUP
  app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/views/signup.html");
  });

  app.post(
    "/signup",
    update.single("foto"),
    passport.authenticate("signup", {
      failureRedirect: "/failsignup",
    }),
    (req, res) => {
      res.send("Check Image");
      let user = req.user;
      console.log(user);

      //grabo en user fecha y hora logueo
      res.sendFile(__dirname + "/views/index.html");
    }
  );
  app.get("/failsignup", (req, res) => {
    warningLogger.error("error en signup");
    res.render("signup-error", {});
  });

  function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/login");
    }
  }

  app.get("/ruta-protegida", checkAuthentication, (req, res) => {
    const { user } = req;
    warningLogger.error(user);
    res.send("<h1>Ruta OK!</h1>");
  });

  //  LOGOUT
  app.get("/logout", (req, res) => {
    req.logout();
    res.sendFile(__dirname + "/views/index.html");
  });

  //  FAIL ROUTE
  app.get("*", (req, res) => {
    res.status(404).render("routing-error", {});
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
