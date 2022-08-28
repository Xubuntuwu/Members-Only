require('dotenv').config();
const bcrypt = require('bcryptjs');
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const expressLayouts = require('express-ejs-layouts');
const passportfunctions = require('./passport/local');
const routes = require('./routes');

const centralRoutes = require('./routes/index');

//mongodb connection
const mongoDb = process.env.DATABASE_URL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true, dbName: 'main' });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();

//express static folders setup
app.use(express.static('public'));

//set up views
app.use(expressLayouts);
app.set("views", [__dirname + '/views/layouts', __dirname + '/views']);
app.set("view engine", "ejs");
app.set('layout', 'outside');
// passport setup

passportfunctions.Setup();

app.use(session({ secret: "kitten", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// make user a global function
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use("/", centralRoutes);

app.listen(process.env.PORT || 3000, () => console.log("app listening on port 3000!"));