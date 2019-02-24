//#region SETUP
"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  mongoose.set("useFindAndModify", false); //TEMP: Avoids deprecation warnings.
  mongoose.set("useCreateIndex", true); //TEMP: Avoids dperecation warnings.
  const ObjectId = mongoose.Types.ObjectId;
const cookieParser = require("cookie-parser");

const {User} = require("./api/user");
const {Cocktail} = require("./api/cocktail");

//Express App Instantiation & Server-wide Middleware
const app = express();
app.use( morgan("dev") );
app.use(express.json());
app.use(cookieParser());
app.use(function(req, res, next) {
  //CORS Header Settings
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE"
  });
  next();
});
app.use(express.static( "client", {maxAge: "1d"} ));
//#endregion



//API Routes
const {router: cocktailsRouter} = require("./api/cocktail");
app.use("/api/cocktail", cocktailsRouter);

const {router: usersRouter} = require("./api/user");
app.use("/api/user", usersRouter);

const {router: authRouter} = require("./api/auth");
app.use("/api/auth", authRouter);



//Catch-all for erroneous requests
app.all("*", (req, res)=> {
  return res.status(404).json({
    errorType: "NoSuchDestination",
    message: "I don't think you know where you're going."
  });
});



//#region Server Management
let server;
const {PORT, DATABASE_URL} = require("./config");

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
  startServer,
  stopServer
};