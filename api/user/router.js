//#region SETUP
"use strict";

const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const bcrypt = require("bcryptjs");

const { COOKIE_EXPIRY } = require("../../config");
const { User } = require("./models");
const { Cocktail } = require("../cocktail")
//#endregion



router.post("/create", (req, res)=> {
  //#region Request Validation
    //Required fields must be present and not empty
    for(let requiredField of ["username", "password"]) {
      if (!req.body[requiredField]) {
        console.error(`Request body is missing the '${requiredField}' field.`)
        return res.status(422).json({
          errorType: "MissingField"
        });
      }
    }

    //Fields are their expected types
    for(let stringField of ["username", "password", "email"]) {
      if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
        console.error(`The '${stringField}' field in the request body must be a String.`);
        return res.status(422).json({
          errorType: "UnexpectedDataType"
        });
      }
    }

    //If 'email' field is present, it is not an empty String
    if (req.body.hasOwnProperty("email") && req.body.email == "") {
      console.error(`The 'email' field in the request body is optional, but it must not be empty if present.`);
      return res.status(422).json({
        errorType: "MissingField"
      });
    }
  //#endregion

  //Unique fields are verified to be so
  const usernameIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({username: req.body.username})
    .then( (user)=> {
      if (user) {
        reject({
          code: 422,
          errorType: "UsernameNotUnique",
        });
      }
      resolve();
    });
  });

  const emailIsUnique = new Promise( (resolve, reject)=> {
    //If the user provided an email address during registration...
    if(req.body.email) {
      User.findOne({email: req.body.email})
      .then( (user)=> {
        if (user) {
          return reject({
            code: 422,
            errorType: "EmailNotUnique",
          });
        }
        resolve();
      });
    }
    else {
      //Providing an email during registration is optional, so it must resolve if 'email' field is not present in the request body.
      resolve();
    }
  });

  Promise.all([usernameIsUnique, emailIsUnique])
  .then( ()=> {
    let newUserData = {
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, 12),
    }
    if (req.body.email) {
      newUserData.email = req.body.email;
    }

    return User.create(newUserData);
  })
  .then( (newUser)=> {
    const sessionJwt = User.makeJwtFor(newUser.username);
    res.cookie("session", sessionJwt, {maxAge: COOKIE_EXPIRY});
    res.cookie("user", newUser.username, {maxAge: COOKIE_EXPIRY});

    return res.status(201).send();
  })
  .catch ( (err)=> {
    //Catch errors thrown by the above '...isUnique()' promise functions
    if (err.errorType) {
      //As of now, err.code will always be 422, but is left dynamic to make future changes less involved
      console.error("/create catch() err:", err);
      return res.status(err.code).json({
        errorType: err.errorType
      });
    }
    //Catch server errors
    console.error(`❗Server Error:\n${err}\n`);
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});

router.get("/:username", (req,res)=> {
  const requestedUsername = req.params.username;

  //#region Request Validation
  if(requestedUsername.length != requestedUsername.trim().length) {
    message: "The 'username' route parameter must not begin or end with whitespace characters."
    return res.status(404).json({
      errorType: "NoSuchUser",
    });
  }
  //#endregion

  //Acts as a container for building the return data
  let returnUser = {};

  return User.findOne({username: requestedUsername})
  .then((locatedUser)=> {
    if(!locatedUser) {
      console.error("No user found with the requested 'username'.");
      return res.status(404).json({
        errorType: "NoSuchUser"
      });
    }
    returnUser = locatedUser.serialize();

    Cocktail.find({creator: locatedUser.username})
    .then((cocktails)=> {
      if(cocktails.length > 0) {
        returnUser.createdCocktails = cocktails.map((cocktail)=> cocktail.serialize());
      }
      else {
        returnUser.createdCocktails = [];
      }
      return res.status(200).json(returnUser);
    })
  })
  .catch((err)=> {
    console.error(`❗Server Error:\n${err}\n`);
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});



module.exports = {
  router
};