//SECTION: Setup
"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  //OPTN: mongoose.set("useFindAndModify", false); //Circumvents deprecation warnings
  //OPTN: mongoose.set("useCreateIndex", true); //Circumvents dperecation warnings
const cookieParser = require("cookie-parser");

//Express App Instantiation
const app = express();

//Server-wide Middleware
app.use( morgan("dev") ); //Logging
app.use( express.json() ); //JSON Request Parsing
app.use( cookieParser() ); //Client Cookie Interactions
app.use( express.static("client", {maxAge: "1d"}) ); //Static File Directory

//CORS Header Settings
app.use( function(req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE"
  });
  next();
});





//SECTION: Routes
const {router: authRouter} = require("./api/auth");
app.use("/api/auth", authRouter);

const {router: usersRouter} = require("./api/user");
app.use("/api/user", usersRouter);

const {router: cocktailsRouter} = require("./api/cocktail");
app.use("/api/cocktail", cocktailsRouter);

//Catch-all route for erroneous server requests
app.all("*", (req, res)=> {
  return res.status(404).json({
    errorType: "NoSuchDestination",
    message: "I don't think you know where you're going."
  });
});





//SECTION: Server Management
const {PORT, DATABASE_URL} = require("./config");
let server;

async function startServer(url = DATABASE_URL) {

  //Connect to the MongoDB database
  await mongoose.connect(url, {useNewUrlParser: true}, (err)=> {
    if(err) {
      throw err;
    }
  });

  //Start the server
  server = app.listen(PORT, ()=> {
    console.log(`Sip is listening on port ${PORT}.`);
  })
  .on("error", (err)=> {
    mongoose.disconnect();
    throw err;
  });

}
async function stopServer() {

  //Disconnect from the database
  await mongoose.disconnect();

  //Stop the server
  server.close((err)=> {
    if(err) {
      throw(err);
    }
  });

}

//If run from a CLI
if (require.main===module) {
  startServer().catch((err)=> {
    console.error(err);
  });
}





module.exports = {
  //Express App Instance
  app,

  //Programmatic Server Controls
  startServer,
  stopServer
};