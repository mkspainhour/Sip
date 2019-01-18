"use strict";

const express = require("express");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const router = express.Router();

const { User } = require("./models");



//Returns statistics on the entire userbase
router.get("/", (req, res)=> {
  User.find({})
  .then( (userList)=> {
    return res.status(200).json({
      message: "OK",
      userCount: userList.length
    });
  })
  .catch( (err)=> {
    res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});

//Returns the public-safe information of the provided user
router.get("/:username", (req, res)=> {
  const providedUsername = req.params.username;

  if (providedUsername.trim().length != providedUsername.length) {
    return res.status(422).json({
      errorType: "StringNotTrimmed",
      message: `Username route parameter '${providedUsername}' begins or ends with whitespace characters.`
    });
  }

  User.findOne({username: providedUsername})
  .then( (user)=> {
    if (user) {
      return res.status(200).json({
        message: "OK",
        user: user.serialize()
      });
    }
    res.status(404).json({
      errorType: "NoSuchUser",
      message: "No user exists with that username."
    });
  })
  .catch( (err)=> {
    res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});

//Creates a user and returns the new account information
router.post("/", (req, res)=> {
  //#region REQUIRED FIELDS
  const requiredFields = ["username", "password"];
  for (let field of requiredFields) {
    if ( !req.body.hasOwnProperty(field) ) {
      return res.status(422).json({
        errorType: "MissingField",
        message: `Request is missing the ${field} field.`,
      });
    }
  };
  //#endregion
  //#region DATA TYPES
  const stringFields = ["username", "password", "email"];
  for(let field of stringFields) {
	  if(req.body.hasOwnProperty(field) && typeof req.body[field] != "string" ) {
      return res.status(422).json({
        errorType: "IncorrectDataType",
        message: `${field} field must be a string.`,
      });
    }
  }
  //#endregion
  //#region STRINGS ARE TRIMMED
  const trimmedFields = ["username", "email"];
  for(let field of trimmedFields) {
    if(req.body.hasOwnProperty(field) && req.body[field].trim().length < req.body[field].length) {
      return res.status(422).json({
        errorType: "StringNotTrimmed",
        message: `${field} field can not begin or end with whitespace.`
      });
    }
  }
  //#endregion
  //#region FIELD SIZING VALIDATION
  const sizedFields = [
    {
      name:"username",
      minLength: 1,
      maxLength: 32 //Anything longer than this is odd to account for in a UI
    },
    {
      name:"password",
      minLength: 10,
      maxLength: 72 //bcryptjs input truncation upper-bound
    }
  ];
  for(let field of sizedFields) {
    //Minimum size check
    if (field.hasOwnProperty("minLength") && req.body.hasOwnProperty(field.name)) {
      if (req.body[field.name].trim().length < field.minLength) {
        return res.status(422).json({
          errorType: "InvalidFieldSize",
          message: `${field.name} does not meet its minimum length.`
        });
      }
    }
    //Maximum length check
    if (field.hasOwnProperty("maxLength") && req.body.hasOwnProperty(field.name)) {
      if (req.body[field.name].trim().length > field.maxLength) {
        return res.status(422).json({
          errorType: "InvalidFieldSize",
          message: `${field.name} exceeds its maximum length.`
        });
      }
    }
  }
  //#endregion
  //#region UNIQUE FIELDS
  let {username, email, password} = req.body;
  let usernameIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({username})
    .then( (user)=> {
      if (user) {
        return reject({
          code: 422,
          errorType: "CredentialNotUnique",
          message: `The username '${username}' is already taken.`
        });
      }
      resolve();
    });
  });
  let emailIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({email})
    .then( (user)=> {
      if (user) {
        return reject({
          code: 422,
          errorType: "CredentialNotUnique",
          message: `The email address '${email}' is already in use.`
        });
      }
      resolve();
    });
  });
  Promise.all([usernameIsUnique, emailIsUnique])
  .then ( ()=> {
    return User.hashPassword(password);
  })
  .then( (hashedPassword)=> {
    return User.create({
      username,
      hashedPassword,
      email
    });
  })
  .then( (newUser)=> {
    return res.status(201).json({
      message: "New user successfully created!",
      newUser: newUser
    });
  })
  .catch ( (err)=> {
    if (err.hasOwnProperty("errorType") && err.errorType == "CredentialNotUnique") {
      return res.status(err.code).json({
        errorType: err.errorType,
        message: err.message,
        errObject: err
      });
    }
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
  //#endregion
});



module.exports = {
  router
};