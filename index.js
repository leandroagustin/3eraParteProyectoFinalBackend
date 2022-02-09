const express = require("express");
const port = process.env.PORT || 8080;
const http = require("http");
const Mensajes = require("./ContenedorMensajes");
const msj = new Mensajes();
const { normalize, denormalize, schema } = require("normalizr");
// const util = require("util");
const { User } = require("./db");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bCrypt = require("bcrypt");

const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
// const authWebRouter = require("./routes/auth");
// const path = require("path");

const passport = require("passport");

// const parseArg = require("minimist");

const dotenv = require("dotenv");
const random = require("./routes/randoms");

const cluster = require("cluster");
const numCPUS = require("os").cpus().length; //cpus() me devuelve un array con la contidad de nucleos [1,2,3,4,5,6,7]

if (cluster.isMaster) {
  for (let i = 0; i < numCPUS; i++) {
    //worker
    cluster.fork(); //creo un proceso para cada nucleo
  }
  cluster.on("exit", () => {
    console.log(`Process ${process.pid} died`);
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = require("socket.io")(server);

  app.use("/products", productsRoutes);
  app.use("/users", usersRoutes);
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
    //productos
    // const getAll = async () => {
    //   let data = [];
    //   await knex
    //     .select("title", "price", "thumbnail")
    //     .from("products")
    //     .then((res) => {
    //       data = res;
    //     });
    //   return data;
    // };
    // const save = async (prod) => {
    //   await knex("products").insert(prod);
    // };

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

  // const options = {
  //   default: { port: 8080 },
  //   alias: { p: "port" },
  // };

  // let arguments = parseArg(process.argv.slice(2), options);

  app.use("/api/randoms", random);

  app.get("/info", (req, res) => {
    let data = {
      "argumentos de entrada": process.argv.slice(2),
      "sistema opertativo": process.platform,
      "version de node": process.version,
      rss: process.memoryUsage().rss,
      path: process.execPath,
      processId: process.pid,
      "carpeta proyecto": process.cwd(),
    };
    res.json({ data });
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
            console.log("Error in SignUp: " + err);
            return done(err);
          }

          if (user) {
            console.log("User already exists");
            return done(null, false);
          }

          const newUser = {
            username: username,
            password: createHash(password),
          };

          User.create(newUser, (err, userWithId) => {
            if (err) {
              console.log("Error in Saving user: " + err);
              return done(err);
            }
            console.log(user);
            console.log("User Registration succesful");
            return done(null, userWithId);
          });
        });
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy((username, password, done) => {
      User.findOne({ username }, (err, user) => {
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
      var user = req.user;
      //console.log(user);

      //grabo en user fecha y hora logueo
      res.sendFile(__dirname + "/views/index.html");
    }
  );
  app.get("/faillogin", (req, res) => {
    console.log("error en login");
    res.render("login-error", {});
  });

  //  SIGNUP
  app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/views/signup.html");
  });

  app.post(
    "/signup",
    passport.authenticate("signup", { failureRedirect: "/failsignup" }),
    (req, res) => {
      var user = req.user;
      //console.log(user);

      //grabo en user fecha y hora logueo
      res.sendFile(__dirname + "/views/index.html");
    }
  );
  app.get("/failsignup", (req, res) => {
    console.log("error en signup");
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
    console.log(user);
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
