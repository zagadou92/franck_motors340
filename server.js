/* ******************************************
 * server.js
 * Main server file
 *******************************************/
require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");require("dotenv").config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./database"); // Adapté à Render
const utilities = require("./utilities");
const accountController = require("./controllers/accountController");
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const usersRoute = require("./routes/usersRoute");


const app = express();

/* ***********************
 * View Engine
 ************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware
 ************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    store: new pgSession({
      pool: pool, // Pool PostgreSQL
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1h
      secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
      httpOnly: true,
    },
    name: "connect.sid",
  })
);

// JWT Middleware
app.use(utilities.checkJWTToken);

// Flash messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Pour que les cookies soient disponibles dans les vues
app.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  res.locals.user = req.user || null; // stocke l’utilisateur du JWT
  next();
});

/* ***********************
 * Routes
 ************************/
app.use(static);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/users", usersRoute);
app.post("/logout", utilities.handleErrors(accountController.logout));

/* ***********************
 * 404 Handler
 ************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Page not found 🥹." });
});

/* ***********************
 * Error Handler
 ************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message =
    err.status == 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Start Server
 ************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App running on http://${host}:${port}`);
});
