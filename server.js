//#region SETUP
"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  //OPTN: mongoose.set("useFindAndModify", false); //Circumvents deprecation warnings
  //OPTN: mongoose.set("useCreateIndex", true); //Circumvents dperecation warnings
const cookieParser = require("cookie-parser");

//Express App Instantiation & Server-wide Middleware
const app = express();

app.use( morgan("dev") );
app.use( express.json() );
app.use( cookieParser() );
app.use( express.static("client", {maxAge: "1d"}));

//CORS Header Settings
app.use( function(req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE"
  });
  next();
});
//#endregion



//#region API Routes
const {router: authRouter} = require("./api/auth");
app.use("/api/auth", authRouter);

const {router: usersRouter} = require("./api/user");
app.use("/api/user", usersRouter);

const {router: cocktailsRouter} = require("./api/cocktail");
app.use("/api/cocktail", cocktailsRouter);
//#endregion



//Catch-all route for erroneous requests
app.all("*", (req, res)=> {
  return res.status(404).json({
    errorType: "NoSuchDestination",
    message: "I don't think you know where you're going."
  });
});



//#region Server Management
const {PORT, DATABASE_URL} = require("./config");
let server;

function startServer(url = DATABASE_URL) {
  return new Promise( (resolve, reject)=> {
    mongoose.connect(url, {useNewUrlParser: true}, (err)=> {
      if(err) {
        return reject(err);
      }
      server = app.listen(PORT, ()=> {
        console.log(`Sip is listening on port ${PORT}`);
        resolve();
      })
      .on("error", (err)=> {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}
function stopServer() {
  return mongoose.disconnect()
  .then( ()=> {
    return new Promise( (resolve, reject)=> {
      console.log("Stopping server...");
      server.close( (err)=> {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

//If run from a CLI
if (require.main === module) {
  startServer()
  .catch( (err)=> {
    console.error(err)
  });
}
//#endregion



module.exports = {
  app,

  //Server Controls
  startServer,
  stopServer
};