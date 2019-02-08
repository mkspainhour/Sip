"use strict";
//#region SETUP
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");

const { JWT_SECRET, COOKIE_EXPIRY } = require("../../config");
const { Cocktail } = require("./models");
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



router.post("/create", authorize, (req, res)=> {
  //#region Request Validation
    //Required fields
    for (let field of ["name", "ingredients"]) {
      if (!req.body[field]) {
        console.error(`Request is missing the '${field}' field.`);
        return res.status(422).json({
          errorType: "MissingField"
        });
      }
    };

    //Data types
    for(let stringField of ["name"]) {
      if(typeof req.body[stringField] != "string") {
        console.error(`${stringField} field must be a String.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
    }

    for(let arrayField of ["ingredients"]) {
      if(!Array.isArray(req.body[arrayField])) {
        console.error(`'${arrayField}' field must be an Array.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
    }

    //Trimmed Strings
    for(let trimmedField of ["name"]) {
      if(req.body[trimmedField].trim().length != req.body[trimmedField].length) {
        console.error(`'${trimmedField}' field can not begin or end with whitespace.`);
        return res.status(422).json({
          errorType: "StringNotTrimmed"
        });
      }
    }

    //Required Ingredient Fields
    for (let ingredient of req.body.ingredients) {
      for (let requiredField of ["name", "measurementUnit", "amount"]) {
        if (!ingredient[requiredField]) {
          console.error(`Ingredient is missing the '${requiredField}' field.`);
          return res.status(422).json({
            errorType: "MissingField"
          });
        }
      }
    };

    //Data types
    for (let ingredient of req.body.ingredients) {
      if (typeof ingredient.name != "string") {
        console.error(`Ingredient 'name' fields must be Strings.`)
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
      if (typeof ingredient.measurementUnit != "string") {
        console.error(`Ingredient 'measurementUnit' fields must be Strings.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
      if (typeof ingredient.amount != "number") {
        console.error(`Ingredient 'amount' fields must be numbers.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
      if (ingredient.hasOwnProperty("abv") && typeof ingredient.abv != "number") {
        console.error(`Ingredient 'abv' fields must be numbers.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
    }

    //Trimmed Strings
    for (let ingredient of req.body.ingredients) {
      if (ingredient.name.trim().length != ingredient.name.length) {
        console.error(`Ingredient 'name' fields can not begin or end with whitespace.`);
        return res.status(422).json({
          errorType: "StringNotTrimmed"
        });
      }
      if (ingredient.measurementUnit.trim().length != ingredient.measurementUnit.length) {
        console.error(`Ingredient 'measurementUnit' fields can not begin or end with whitespace.`);
        return res.status(422).json({
          errorType: "StringNotTrimmed"
        });
      }
    }

    //Field sizing
    for(let ingredient of req.body.ingredients) {
      if(ingredient.amount <= 0) {
        console.error(`Ingredient 'amount' field must be larger than 0.`);
        return res.status(422).json({
          errorType: "InvalidFieldSize"
        });
      }
      if(ingredient.hasOwnProperty("abv") && (ingredient.abv < 0 || ingredient.abv > 100) ) {
        console.error(`Ingredient 'abv' field must be larger than 0, but less than or equal to 100.`);
        return res.status(422).json({
          errorType: "InvalidFieldSize"
        });
      }
    }
  //#endregion

  //Cocktail Recipe creation
  Cocktail.create({
    name: req.body.name,
    creator: jwt.verify(req.cookies.session, JWT_SECRET).sub,
    ingredients: req.body.ingredients
  })
  .then((newCocktailRecipe)=> {
    return res.status(201).json(newCocktailRecipe.serialize());
  })
  .catch((err)=> {
    console.error(`✖ Server Error:\n${err}\n`);
    return res.status(500).send();
  });
});

router.put("/update", authorize, (req, res)=> {
  //#region Request Validation
    //targetId must be present
    if (!req.body.targetId) {
      console.error(`No 'targetId' present in the request body.`);
      return res.status(422).json({
        errorType: "MissingField"
      });
    }

    //targetId must be a valid ObjectId
    if(!ObjectId.isValid(req.body.targetId)) {
      console.error(`The provided cocktail 'targetId' is an invalid ObjectId.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }

    //Either newName or newIngredients must be present
    if (!req.body.newName && !req.body.newIngredients)
    {
      return res.status(422).json({
        errorType: "NoActionableFields"
      });
    }

    //newName must be a String
    if(req.body.newName && typeof req.body.newName != "string") {
      console.error(`'name' field must be a string.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }

    //newIngredients must be an Array
    if(req.body.newIngredients && !Array.isArray(req.body.newIngredients)) {
      console.error(`'ingredients' field must be an Array.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }

    //newName must not begin or end with whitespace
    if(req.body.newName.trim().length < req.body.newName.length) {
      console.error(`'newName' field can not begin or end with whitespace.`);
      return res.status(422).json({
        errorType: "StringNotTrimmed"
      });
    }
  //#endregion

  const updateValues = {};

  if (req.body.newName) {
    updateValues.name = req.body.newName;
  }
  if (req.body.newIngredients) {
    updateValues.ingredients = req.body.newIngredients;
  }

  Cocktail.findOneAndUpdate({_id: req.body.targetId}, updateValues, {new:true})
  .then((cocktailRecipe)=> {
    if (!cocktailRecipe) {
      return res.status(404).json();
    }
    return res.status(200).json(cocktailRecipe);
  })
  .catch( (err)=> {
    console.error(`✖ ${err}`);
    return res.status(500).send();
  });
});

router.delete("/delete", authorize, (req, res)=> {
  //#region Request Validation
    //Request body contains 'targetId'
    if (!req.body.targetId) {
      console.error(`No cocktail 'targetId' field in the request body.`);
      return res.status(422).json({
        errorType: "MissingField"
      });
    }

    //'targetId' is a valid ObjectId
    if(!mongoose.Types.ObjectId.isValid(req.body.targetId)) {
      return res.status(422).json({
        errorType: "InvalidObjectId"
      });
    }
  //#endregion

  let sessionUser = jwt.verify(req.cookies.session, JWT_SECRET).sub;
  Cocktail.findOneAndDelete({_id: req.body.targetId, creator: sessionUser})
  .then( (locatedCocktail)=> {
    if(!locatedCocktail) {
      console.error("No cocktail recipe exists with the provided 'targetId' that belongs to the current session user.");
      return res.status(404).json({
        errorType: "NoSuchCocktail"
      });
    }
    return res.status(200).json(locatedCocktail);
  })
  .catch(err => {
    console.error(err);
    return res.status(500).send();
  });
});



module.exports = {
  router
};