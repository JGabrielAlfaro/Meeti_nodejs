const express = require("express");
require("dotenv").config({ path: "variables.env" });
const router = require("./routes/index");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

const passport = require("./config/passport");

//IMPORTANDO LIBRERIAS FORMULARIO
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

//IMPORTANDO MODELOS

//CONEXIÓN A LA BASE DE DATOS
const db = require("./config/db");
require("./models/Usuarios");
require("./models/Categorias");
require("./models/Grupos");
require("./models/Meeti");
require("./models/Comentarios");
db.sync()
  .then(() => console.log("Estado conexión BD: OK"))
  .catch((error) => console.log(error));

//APLICACIÓN EXPRESS
const app = express();

//BODY PARSER: Leer datos de un formulario
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//HABILITAR EJS como template Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

//Ubicacion vistas
app.set("views", path.join(__dirname, "./views"));

//Archivos estaticos
app.use(express.static("public"));

//Habilitar cookie parser
app.use(cookieParser());

//Crear Sesiones
app.use(
  session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
  })
);

//Iniciar passport
app.use(passport.initialize());
app.use(passport.session());



//Conectar flash Messages
app.use(flash());

//Middleware (usuario logueado, flash messages,fecha actual y demás)
app.use((req, res, next) => {
  res.locals.usuario = req.user || null; //Pasamos la variable usuario.id o locals.usuario.id a la vista (req.user proviene de passport)
  res.locals.mensajes = req.flash();
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();
  res.locals.month = fecha.getMonth();
  next();
});



//ROUTING
app.use("/", router());

//ARRIENDO EL SERVIDOR
app.listen(process.env.PORT || 5000, process.env.HOST || "0.0.0.0", () => {
  console.log("Servidor corriendo en el puerto " + process.env.PORT);
}); 
