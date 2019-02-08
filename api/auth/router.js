"use strict";
//#region SETUP
const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWT_SECRET, COOKIE_EXPIRY } = require("../../config");
const { User } = require("../users");
//#endregion



//Middleware
const authorize = function(req, res, next) {
  //Ensure that a session cookie accompanies the request
  if (!req.cookies.session) {
    return res.status(401).json({
      errorType: "NoActiveSession",
    });
  }

  //Verify that the session cookie JWT is not expired or malformed
  let sessionUser;
  try {
    sessionUser = jwt.verify(req.cookies.session, JWT_SECRET).sub;
  }
  catch(err) {
    res.clearCookie("session");
    if (err.name == "TokenExpiredError") {
      return res.status(401).json({
        errorType: "ExpiredJWT",
        message: "Session cleared."
      });
    }
    //JWT is generally malformed
    return res.status(401).json({
      errorType: "MalformedJWT",
      message: "Session cleared."
    });
  }

  //The session is valid. Extend its expiry by another day.
  res.cookie("session", User.makeJwtFor(sessionUser), {expires: COOKIE_EXPIRY});
  res.cookie("user", sessionUser, {expires: COOKIE_EXPIRY});

  next();
}



router.post("/sign-in", (req, res)=> {
  //#region Request Validation
    //A session must not already be active
    if(req.cookies.session) {
      return res.status(400).json({
        errorType: "SessionAlreadyActive",
        message: "It is not possible to sign in while a user session is already active.",
      })
    }

    //Required fields must be present and non-empty
    for(let requiredField of ["username", "password"]) {
      if (!req.body[requiredField]) {
        console.error(`Request body is missing the '${requiredField}' field.`);
        return res.status(422).json({
          errorType: "MissingField",
        });
      }
    }

    //The username and password fields are Strings
    for(let stringField of ["username", "password"]) {
      if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
        console.error(`The '${stringField}' field in the request body must be a String.`);
        return res.status(422).json({
          errorType: "UnexpectedDataType",
        });
      }
    }

    //The username field is trimmed
    for(let trimmedField of ["username", "password"]) {
      if(req.body[trimmedField].trim().length != req.body[trimmedField].length) {
        console.error(`The '${trimmedField}' String field in the request body may not begin or end with whitespace.`)
        return res.status(422).json({
          errorType: "UntrimmedString",
        });
      }
    }
  //#endregion

  return User.findOne({
    username: req.body.username,
  })
  .then((locatedUser)=> {
    //If there is a user with the provided username, and the provided password is correct
    if(locatedUser && bcrypt.compareSync(req.body.password, locatedUser.hashedPassword)) {
      res.cookie("session", User.makeJwtFor(req.body.username), {expires: COOKIE_EXPIRY});
      res.cookie("user", req.body.username, {expires: COOKIE_EXPIRY});
      return res.status(204).send();
    }
    //Otherwise, the username and password provided do not both belong to a user
    return res.status(404).json({
      errorType: "NoSuchUser",
    });
  })
  .catch( (err)=> {
    console.error(`✖ Server Error:\n${err}`);
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  })
});

router.get("/sign-out", (req, res)=> {
  //There is no situation in which only one cookie is present, but this seems generally safer
  if(req.cookies) {
    res.clearCookie("session");
    res.clearCookie("user");
  }
  return res.status(204).send();
});

//TEMP: Development tool. Not intended for production.
router.get("/sessionTest", authorize, (req, res)=> {
  let decodedJwt = jwt.verify(req.cookies.session, JWT_SECRET);
  return res.status(200).json({
    message: "You're authorized!",
    username: req.cookies.user,
    sessionToken: decodedJwt
  });
});



module.exports = {
  router
};