//SECTION: Setup
"use strict";

const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const bcrypt = require("bcryptjs");

const { COOKIE_EXPIRY } = require("../../config");
const { User } = require("./models");
const { Cocktail } = require("../cocktail")





//SECTION: Routes
router.post("/create", (req, res)=> {
  //Request Validation

  //Required fields must be present and not empty
  for(let requiredField of ["username", "password"]) {
    if (!req.body[requiredField]) {
      return res.status(422).json({
        errorType: "MissingField"
      });
    }
  }

  //Fields are their expected types
  for(let stringField of ["username", "password", "email"]) {
    if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }
  }

  //If 'email' field is present, it is not an empty String
  if (req.body.hasOwnProperty("email") && req.body.email == "") {
    return res.status(422).json({
      errorType: "MissingField"
    });
  }

  //Unique fields are verified to be so
  const usernameIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({username: req.body.username})
    .then( (user)=> {
      if (user) {
        reject({
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

  //If the username and email are determined to be unique...
  Promise.all([usernameIsUnique, emailIsUnique])
  .then( ()=> {
    //Create the new user data
    let newUserData = {
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, 12),
    }

    //If the user chose to include their email during registration
    if (req.body.email) {
      newUserData.email = req.body.email;
    }

    //Create the user account
    return User.create( newUserData );
  })
  .then( (newUser)=> {
    //Set the session cookies for the new user
    const sessionJwt = User.makeJwtFor(newUser.username);
    res.cookie("session", sessionJwt, {maxAge: COOKIE_EXPIRY});
    res.cookie("user", newUser.username, {maxAge: COOKIE_EXPIRY});

    return res.status(201).send();
  })
  .catch( (err)=> {
    //Catch errors thrown by the above '...isUnique()' promise functions
    if (err.errorType) {
      return res.status(422).json({
        errorType: err.errorType
      });
    }
    //Catch server errors
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});

router.get("/:username", (req,res)=> {
  //Request Validation
  const requestedUsername = req.params.username;
  if(requestedUsername.length != requestedUsername.trim().length) {
    return res.status(404).json({
      //No username should contain whitespace
      errorType: "NoSuchUser",
    });
  }

  //Acts as a container for building the return data
  let returnUser = {};

  return User.findOne({username: requestedUsername})
  .then((locatedUser)=> {
    if(!locatedUser) {
      //The target username is not attached to an account
      return res.status(404).json({
        errorType: "NoSuchUser"
      });
    }

    //Serialize the raw user account information for public viewing
    returnUser = locatedUser.serialize();

    //Look for any cocktail recipes created by that account
    Cocktail.find({creator: locatedUser.username})
    .then((cocktails)=> {
      if(cocktails.length > 0) {
        //If that username is a creator of any number of cocktails
        returnUser.createdCocktails = cocktails.map((cocktail)=> cocktail.serialize());
      }
      else {
        returnUser.createdCocktails = [];
      }

      //Return the user account information with any existing cocktail recipes
      return res.status(200).json( returnUser );
    })
  })
  .catch(()=> {
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});





module.exports = {
  router
};