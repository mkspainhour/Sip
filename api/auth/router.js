//SECTION: Setup
"use strict";

const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const bcrypt = require("bcryptjs");

const { COOKIE_EXPIRY } = require("../../config");
const { User } = require("../user");





//SECTION: Routes
router.post("/sign-in", (req, res)=> {
  //Request Validation

  //A session must not already be active
  if(req.cookies.session) {
    return res.status(400).json({
      errorType: "SessionAlreadyActive",
    })
  }

  //Required fields must be present and non-empty
  for(let requiredField of ["username", "password"]) {
    if (!req.body[requiredField]) {
      return res.status(422).json({
        errorType: "MissingField",
      });
    }
  }

  //The username and password fields must be Strings
  for(let stringField of ["username", "password"]) {
    if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
      return res.status(422).json({
        errorType: "UnexpectedDataType",
      });
    }
  }

  return User.findOne({username: req.body.username})
  .then((locatedUser)=> {
    //If a user was found with the provided username, and the provided password is valid
    if(locatedUser && bcrypt.compareSync(req.body.password, locatedUser.hashedPassword)) {
      //Set the 'session' JWT cookie
      res.cookie("session", User.makeJwtFor(req.body.username), {expires: COOKIE_EXPIRY});
      //Set the 'username' cookie
      res.cookie("user", req.body.username, {expires: COOKIE_EXPIRY});
      return res.status(204).send();
    }
    //Otherwise, the username and password provided do not both belong to a user
    return res.status(404).json({
      errorType: "NoSuchUser",
    });
  })
  .catch(()=> {
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});

router.get("/sign-out", (req, res)=> {
  //Clear any present cookies
  if(req.cookies.session) {
    res.clearCookie("session");
  }
  if(req.cookies.user) {
    res.clearCookie("user");
  }
  return res.status(204).send();
});





module.exports = {
  router
};