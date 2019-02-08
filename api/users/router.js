"use strict";
//#region SETUP
const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const bcrypt = require("bcryptjs");

const { COOKIE_EXPIRY } = require("../../config");
const { User } = require("./models");
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

    //If optional email field is present, it is not empty
    if (req.body.hasOwnProperty("email") && req.body.email == "") {
      console.error(`The 'email' field in the request body is optional, but it must not be empty if present.`);
      return res.status(422).json({
        errorType: "MissingField"
      });
    }

    //Fields that are expected to be Strings, are Strings.
    for(let stringField of ["username", "password", "email"]) {
      if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
        console.error(`The '${stringField}' field in the request body must be a String.`);
        return res.status(422).json({
          errorType: "UnexpectedDataType"
        });
      }
    }

    //Fields that are expected to be trimmed, are trimmed.
    for(let field of ["username", "password", "email"]) {
      if(req.body.hasOwnProperty(field) && req.body[field].trim().length != req.body[field].length) {
        console.error(`The '${field}' field in the request body may not begin or end in whitespace.`);
        return res.status(422).json({
          errorType: "UntrimmedString"
        });
      }
    }
  //#endregion

  //Unique fields are verified to be so
  let usernameIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({username: req.body.username})
    .then( (user)=> {
      if (user) {
        console.error("username not unique:", user);
        reject({
          code: 422,
          errorType: "UsernameNotUnique",
        });
      }
      resolve();
    });
  });

  let emailIsUnique = new Promise( (resolve, reject)=> {
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
    let sessionJwt = User.makeJwtFor(newUser.username);
    res.cookie("session", sessionJwt, {maxAge: COOKIE_EXPIRY});
    res.cookie("user", newUser.username, {maxAge: COOKIE_EXPIRY});

    return res.status(201).send();
  })
  .catch ( (err)=> {
    //Catch errors thrown by the above 'isUnique() promise functions
    if (err.errorType) {
      //err.code will be 422, but is left dynamic to make future modifications less involved
      console.error("/create catch() err:", err);
      return res.status(err.code).json({
        errorType: err.errorType
      });
    }
    //Catch server errors
    console.error(`✖ Server Error:\n${err}\n`);
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});



module.exports = {
  router
};