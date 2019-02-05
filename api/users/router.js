"use strict";
//#region SETUP
const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWT_SECRET } = require("../../config");
const { User } = require("./models");
//#endregion



//JWT Validation Middleware
const authorize = function(req, res, next) {
  //Ensure that a session cookie exists
  if (!req.cookies.session) {
    return res.status(401).json({
      errorType: "Unauthorized",
      message: `No session authorization cookie found.`
    });
  }
  //Validate the session cookie JWT
  try {
    jwt.verify(req.cookies.session, JWT_SECRET);
  }
  catch(err) {
    res.clearCookie("session", {httpOnly:true});
    return res.status(401).json({
      errorType: "MalformedJWT",
      message: `Invalid session cookie. Session reset.`
    });
  }
  next();
}



router.post("/create", (req, res)=> {
  //Required fields must be present and not empty
  for(let requiredField of ["username", "password"]) {
    if (!req.body.hasOwnProperty(requiredField) || req.body[requiredField]=="") {
      return res.status(422).json({
        errorType: "MissingField",
        message: `Request body is missing the '${requiredField}' field.`,
      });
    }
  }

  //Optional email field, if present, is not empty
  if (req.body.hasOwnProperty("email") && req.body.email == "") {
    return res.status(422).json({
      errorType: "MissingField",
      message: `The 'email' field in the request body is optional, but must not be empty if present.`,
    });
  }

  //The username, hashedPassword, and email fields are Strings
  for(let stringField of ["username", "password", "email"]) {
    if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
      return res.status(422).json({
        errorType: "UnexpectedDataType",
        message: `The '${stringField}' field in the request body must be a String.`,
      });
    }
  }

  //The username and email fields are trimmed
  for(let field of ["username", "password", "email"]) {
    if(req.body.hasOwnProperty(field) && req.body[field].trim().length != req.body[field].length) {
      return res.status(422).json({
        errorType: "UntrimmedString",
        message: `The '${field}' field in the request body may not begin or end in whitespace.`,
      });
    }
  }

  //Unique fields are verified to be so
  let usernameIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({username: req.body.username})
    .then( (user)=> {
      if (user) {
        reject({
          code: 422,
          errorType: "CredentialNotUnique",
          message: `The username '${req.body.username}' is already taken.`
        });
      }
      resolve();
    });
  });
  let emailIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({email: req.body.email})
    .then( (user)=> {
      if (user) {
        return reject({
          code: 422,
          errorType: "CredentialNotUnique",
          message: `The email address '${req.body.email}' is already in use.`
        });
      }
      resolve();
    });
  });

  Promise.all([usernameIsUnique, emailIsUnique])
  .then( ()=> {
    return User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, 12),
      email: req.body.email,
    });
  })
  .then( (newUser)=> {
    let sessionJwt = User.makeJwtFor(newUser.username);
    res.cookie("session", sessionJwt, {maxAge: (2)*24*60*60*1000});

    return res.status(201).json({
      message: "User account successfully created.",
    });
  })
  .catch ( (err)=> {
    //Catch errors thrown by the isUnique() promises
    if (err.errorType == "CredentialNotUnique") {
      return res.status(err.code).json({
        errorType: err.errorType,
        message: err.message,
      });
    }
    //Catch server errors
    console.error(`\n✖ Server Error:\n${err}\n`);
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});



module.exports = {
  router
};