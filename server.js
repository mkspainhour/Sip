"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const passport = require("passport");



// EXPRESS APP INSTANTIATION & SERVER-WIDE MIDDLEWARE
//
const app = express();
TEMP: app.use( morgan("dev") );
app.use( express.json() );
app.use( function (req, res, next) {
  res.set({
    //CORS SETTINGS
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE"
  });
  next();
});



// ROUTES
//
const {router: cocktailsRouter} = require("./cocktails");
app.use("/api/cocktails/", cocktailsRouter);

const {router: usersRouter} = require("./users");
app.use("/api/users/", usersRouter);



// CATCH-ALL FOR ERRONEOUS REQUESTS
//
app.all("*", (req, res)=> {
  return res.status(404).json({
    errorType: "NoSuchDestination",
    message: "I don't think you know where you're going."
  });
});



// SERVER MANAGEMENT
//
let server;
const {PORT, DATABASE_URL} = require("./config");

function startServer(url = DATABASE_URL) {
  return new Promise( (resolve, reject)=> {
    mongoose.connect(url, {useNewUrlParser: true}, (err)=> {
      if(err) {
        return reject(err);
      }
      server = app.listen(PORT, ()=> {
        //console.log(`Your app is listening on port ${PORT}`);
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

if (require.main === module) {
  startServer()
  .catch( (err)=> {
    console.error(err)
  });
}



// EXPORTS
//
module.exports = {
  app,
  startServer,
  stopServer
};