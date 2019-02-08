"use strict";
//#region SETUP
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  mongoose.set("useFindAndModify", false); //TEMP: Avoids deprecation warnings.
  mongoose.set("useCreateIndex", true); //TEMP: Avoids dperecation warnings.
  const ObjectId = mongoose.Types.ObjectId;
const cookieParser = require("cookie-parser");

const {User} = require("./api/users");
const {Cocktail} = require("./api/cocktails");

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
const {router: cocktailsRouter} = require("./api/cocktails");
app.use("/api/cocktail", cocktailsRouter);

const {router: usersRouter} = require("./api/users");
app.use("/api/user", usersRouter);

const {router: authRouter} = require("./api/auth");
app.use("/api/auth", authRouter);




//Fetch all of a user's public-facing information
app.get("/user/:username", (req,res)=> {
  const requestedUsername = req.params.username;

  if(requestedUsername.length != requestedUsername.trim().length) {
    return res.status(422).json({
      errorType: "UntrimmedString",
      message: "The 'username' route parameter must not begin or end in whitespace."
    });
  }

  let returnUser; //Acts as a container for building the return data
  User.findOne({username: requestedUsername})
  .then((user)=> {
    if(user) {
      returnUser = user.serialize(); //username, createdAt
      return Cocktail.find({creator: user.username})
    }
    return res.status(404).json({
      errorType: "NoSuchUser",
      message: "No user found with the requested 'username'."
    })
  })
  .then((cocktails)=> {
    returnUser.createdCocktails = cocktails.map((cocktail => cocktail.serialize()));
    return res.status(200).json(returnUser);
  })
  .catch((err)=> {
    console.error(err);
  });
});

//Fetch a cocktail recipe
app.get("/cocktail/:id", (req,res)=> {
  const requestedId = req.params.id;

  if(!ObjectId.isValid(requestedId)) {
    return res.status(422).json({
      errorType: "InvalidObjectId",
      message: "The 'id' route parameter is an invalid ObjectId."
    })
  }

  Cocktail.findOne({_id: requestedId})
  .then((requestedCocktail)=> {
    if(requestedCocktail) {
      return res.status(200).json(requestedCocktail.serialize());
    }
    return res.status(404).json({
      errorType: "NoSuchCocktail",
      message: "No cocktail recipe found with the requested 'id'."
    })
  })
  .catch((err)=> {
    console.error(err);
  });
});



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