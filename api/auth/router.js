"use strict";
//#region SETUP
const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../../config");
const { User } = require("../users");
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
  //Verify that the session cookie JWT is not malformed
  try {
    jwt.verify(req.cookies.session, JWT_SECRET);
  }
  catch(err) {
    res.clearCookie("session");
    return res.status(401).json({
      errorType: "MalformedJWT",
      message: `Invalid session cookie. Session reset.`
    });
  }
  next();
}



router.post("/sign-in", (req, res)=> {
  //A session must not already be active
  if(req.cookies.session) {
    return res.status(400).json({
      errorType: "SessionAlreadyActive",
      message: "It is not possible to sign in while a user session is already active.",
    })
  }

  //Required fields must be present and not empty
  for(let requiredField of ["username", "hashedPassword"]) {
    if (!req.body.hasOwnProperty(requiredField) || req.body[requiredField]=="") {
      return res.status(422).json({
        errorType: "MissingField",
        message: `Request body is missing the '${requiredField}' field.`,
      });
    }
  }

  //The username and hashedPassword fields are Strings
  for(let stringField of ["username", "hashedPassword"]) {
    if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
      return res.status(422).json({
        errorType: "UnexpectedDataType",
        message: `The '${stringField}' field in the request body must be a String.`,
      });
    }
  }

  //The username field is trimmed
  for(let trimmedField of ["username", "hashedPassword"]) {
    if(req.body[trimmedField].trim().length != req.body[trimmedField].length) {
      return res.status(422).json({
        errorType: "UntrimmedString",
        message: `The '${trimmedField}' field in the request body may not begin or end in whitespace.`,
      });
    }
  }

  return User.findOne({
    username: req.body.username,
    hashedPassword: req.body.hashedPassword
  })
  .then( (locatedUser)=> {
    if(locatedUser) {
      res.cookie("session", User.makeJwtFor(req.body.username), {
        httpOnly: true,
        expires: new Date( Date.now() + (1)*24*60*60*1000 ) //1 day from now, in milliseconds
      });
      return res.status(200).json({
        message: `${req.body.username} signed in.`
      });
    }
    //The username and hashedPassword provided point to no user
    return res.status(404).json({
      errorType: "NoSuchUser",
      message: "No user exists with the specified credentials.",
    });
  })
  .catch( (err)=> {
    console.error(`\n✖ Server Error:\n${err}\n`);
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  })
});

router.get("/sign-out", (req, res)=> {
  if(req.cookies.session) {
    res.clearCookie("session");
    return res.status(200).json({
      message: `User logged out.`
    });
  }
  return res.status(400).json({
    errorType: "NoActiveSession",
    message: "It is not possible to sign out when no one has been signed in.",
  });
});

//TEMP
router.get("/sessionTest", authorize, (req, res)=> {
  return res.status(200).json({
    message: "You're authorized!",
    currentUser: jwt.verify(req.cookies.session, JWT_SECRET).sub,
  });
});



module.exports = {
  router
};