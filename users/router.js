"use strict";

const express = require("express");
const router = express.Router();
const {User} = require("./models");



// ENDPOINTS
//
//TEMP, DEV: Get info on all users; unsecure
router.get("/", (req, res)=> {
  User.find().then( (users)=> {
    res.json({
      userCount: users.length,
      userList: users.map( (user)=> user.devInfo() ),
    });
  })
  .catch( (err)=> {
    res.status(500).json({
      message: "ERROR: Internal server error.",
      errorObject: err
    });
  });
});

//MissingRequiredField
//StringRequired
//FieldSize

//Register a new user
router.post("/", (req, res)=> {

  //#region CHECK FOR REQUIRED FIELDS
  const requiredFields = [
    "username",
    "password"
  ];
  for(let i=0; i<requiredFields.length; i++) {
	  if( !(requiredFields[i] in req.body) ) {
      return res.status(422).json({
        status: 422,
        errorType: "MissingRequiredField",
        message: "Error: the request is missing a required field.",
        field: requiredFields[i]
      });
    }
  }
  console.log("✓ Required fields");
  //#endregion

  //#region TYPE VALIDATION
  //The following region can be duplicated and tweaked to validate other data types.
  const stringFields = [
    "username",
    "password",
    "email"
  ];
  for(let i=0; i<stringFields.length; i++) {
	  if( stringFields[i] in req.body && typeof req.body[stringFields[i]] != "string" ) {
      return res.status(422).json({
        status: 422,
        errorType: "StringRequired",
        message: "Error: the field must be a string.",
        field: stringFields[i]
      });
    }
  }
  console.log("✓ Required types: strings");
  //#endregion

  //#region SIZING VALIDATION
  //Available settings: fieldName(string, required), min(positive int), max(positive int)
  const sizedFields = [
    {
      fieldName:"username",
      min: 1
    },
    {
      fieldName:"password",
      min: 10,
      max: 72 //bcryptjs truncation upper-bound
    },
    {
      fieldName:"nonsense",
      min: 1
    }
  ];

  for(let i=0; i<sizedFields.length; i++) {

    //Minimum length checks
    if (sizedFields[i].hasOwnProperty("min") && req.body.hasOwnProperty( sizedFields[i].fieldName)) {
      if (req.body[sizedFields[i].fieldName].trim().length < sizedFields[i].min) {
        //Failure case
        return res.status(422).json({
          code: 422,
          errorType: "FieldSize",
          message: "Data does not meet sizing requirements.",
          field: sizedFields[i].fieldName
        });
      }
    }

    //Maximum length checks
    if (sizedFields[i].hasOwnProperty("max") && req.body.hasOwnProperty( sizedFields[i].fieldName)) {
      if (req.body[sizedFields[i].fieldName].trim().length > sizedFields[i].max) {
        //Failure case
        return res.status(422).json({
          code: 422,
          errorType: "FieldSize",
          message: "Data does not meet sizing requirements.",
          field: sizedFields[i].fieldName
        });
      }
    }

  }
  console.log("Sized fields...CHECK");
  //#endregion

  //#region UNIQUE FIELDS ARE NOT DUPLICATED
  // let {username, password, email} = req.body;
  // console.log("email: "+email);
  // User.find( {username} ).count()
  //   .then( (count)=> {
  //     if (count > 0) {
  //       // There is an existing user with the attempted username
  //       console.warn("Username already exists.");
  //       return res.status(500).json({
  //         status: 422,
  //         type: "ExistingUsernameError",
  //         message: "Username is already in use.",
  //         target: username
  //       });
  //     }
  //   })
  //   .catch( (err)=> {
  //     return res.status(500).json({
  //       status: 500,
  //       message: "Internal server error.",
  //       err
  //     });
  //   });

  // if (email) {
  //   User.find( {email} ).count()
  //   .then( (count)=> {
  //     if (email && count > 0) {
  //       // There is an existing user with the attempted email
  //       console.warn("Email is already in use.", email);
  //       return res.status(422).json({
  //         status: 422,
  //         type: "ExistingEmailError",
  //         message: "Email already in use.",
  //         target: email
  //       });
  //     }
  //     // Email is unique
  //   });
  // }
  //   console.log("Hashing password...");
  //   return User.hashPassword(password);
  //   console.log("Creating user...");
  //     //BOOKMARK: This keeps pooping the bed. Investigate possible causes.
  //     return User.create({
  //       username,
  //       hashedPassword: hash,
  //       email
  //     });

  //   .then( (user)=> {
  //     //TEMP, DEV: unsecure use of user.devInfo()
  //     console.log("Made it!");
  //     return res.status(201).json( user.devInfo() );
  //   })
  //   .catch( (err)=> {
  //     if(err.errorType != "ValidationError") {
  //       return res.status(500).json({
  //         status: 500,
  //         message: "Internal server error.",
  //       });
  //     }
  //   });
  //#endregion

});



// EXPORTS
//
module.exports = {
  router
};