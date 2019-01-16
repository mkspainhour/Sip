"use strict";

const express = require("express");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const router = express.Router();
const {User} = require("./models");



// ENDPOINTS
//
//TEMP: Development tool. Get info on all users.
router.get("/", (req, res)=> {
  User.find({})
  .then( (userList)=> {
    res.json({
      userCount: userList.length,
      userList: userList.map( (user)=> user.publicInfo() ),
    });
  })
  .catch( (err)=> {
    res.sendStatus(500);
  });
});

//Register a new user
router.post("/", (req, res)=> {

  //#region REQUIRED FIELDS VALIDATION
  const requiredFields = ["username", "password"];

  for (let field of requiredFields) {
    if (req.body.hasOwnProperty(field) == false) {
      console.error(`× Required field '${field}' is missing.`);
      return res.status(422).json({
        status: 422,
        errorType: "MissingField",
        message: `Request is missing the ${field} field.`,
      });
    }
  };

  console.log("✓ All required fields present.");
  //#endregion

  //#region REQUIRED STRING TYPES VALIDATION
  const stringFields = ["username", "password", "email"];

  for(let field of stringFields) {
	  if(req.body.hasOwnProperty(field) && typeof req.body[field] != "string" ) {
      console.error(`× ${field} field data type must be a string.`);
      return res.status(422).json({
        status: 422,
        errorType: "IncorrectDataType",
        message: `${field} field must be a string.`,
      });
    }
  }

  console.log("✓ Required types: strings verified.");
  //#endregion

  //#region FIELD SIZING VALIDATION
  const sizedFields = [
    {
      name:"username",
      minLength: 1
      //maxLength
    },
    {
      name:"password",
      minLength: 10,
      maxLength: 72 //bcryptjs truncation upper-bound
    }
  ];

  for(let field of sizedFields) {
    //Minimum size checks
    if (req.body.hasOwnProperty(field.name) && field.hasOwnProperty("minLength")) {
      if (req.body[field.name].trim().length < field.minLength) {
        console.error(`× Field ${field.name} is too short.`);
        return res.status(422).json({
          code: 422,
          errorType: "InvalidFieldSize",
          message: `${field.name} does not meet its minimum length.`
        });
      }
    }
    //Maximum length checks
    if (req.body.hasOwnProperty(field.name) && field.hasOwnProperty("maxLength")) {
      if (req.body[field.name].trim().length > field.maxLength) {
        console.error(`× Field ${field.name} is too long.`);
        return res.status(422).json({
          code: 422,
          errorType: "InvalidFieldSize",
          message: `${field.name} exceeds its maximum length.`
        });
      }
    }
  }

  console.log("✓ Present fields meet their sizing requirements.");
  //#endregion

  //#region ENSURE UNIQUE FIELDS ARE UNIQUE
  let {username, email, password} = req.body;

  let usernameIsUnique = new Promise( (resolve, reject)=> {
    User.findOne({username})
    .then( (user)=> {
      if (user) {
        console.error("× Username is taken.");
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
        console.error("× Email address is already in use.");
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
    console.log("✓ Unique fields are verified to be unique.");
    return User.hashPassword(password);
  })
  .then( (hashedPassword)=> {
    console.log("✓ Password hashed without error.");
    return User.create({
      username,
      hashedPassword,
      email
    });
  })
  .then( (newUser)=> {
    console.log("✓ User created!")
    res.status(201).json( newUser );
  })
  .catch ( (err)=> {
    if (err.hasOwnProperty("errorType") && err.errorType == "CredentialNotUnique") {
      return res.status( err.code ).json( err );
    }
    return res.sendStatus(500);
  });
  //#endregion

});



// EXPORTS
//
module.exports = {
  router
};