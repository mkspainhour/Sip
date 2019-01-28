"use strict";
//#region SETUP
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../../config");
const { Cocktail } = require("./models");
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



//Create a cocktail recipe
router.post("/create", authorize, (req, res)=> {
  //Required fields
  let requiredFields = ["name", "ingredients"];
  for (let field of requiredFields) {
    if ( !req.body.hasOwnProperty(field) || req.body[field] == "") {
      return res.status(422).json({
        errorType: "MissingField",
        message: `Request is missing the '${field}' field.`,
      });
    }
  };

  //Data types
  let stringFields = ["name"];
  for(let field of stringFields) {
    if(typeof req.body[field] != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType",
        message: `${field} field must be a string.`,
      });
    }
  }

  const arrayFields = ["ingredients"];
  for(let field of arrayFields) {
    if( !Array.isArray(req.body[field]) ) {
      return res.status(422).json({
        errorType: "IncorrectDataType",
        message: `'${field}' field must be an Array.`,
      });
    }
  }

  //Trimmed Strings
  let trimmedFields = ["name"]
  for(let field of trimmedFields) {
    if(req.body[field].trim().length < req.body[field].length ) {
      return res.status(422).json({
        errorType: "StringNotTrimmed",
        message: `'${field}' field can not begin or end with whitespace.`,
      });
    }
  }


  //Ingredients Validations
  //Required Fields
  requiredFields = ["name", "measurementUnit", "amount"];
  for (let ingredient of req.body.ingredients) {
    for (let field of requiredFields) {
      if ( !ingredient.hasOwnProperty(field) || ingredient[field] == "" ) {
        return res.status(422).json({
          errorType: "MissingField",
          message: `Ingredient is missing the '${field}' field.`,
        });
      }
    }
  };

  //Data types
  for (let ingredient of req.body.ingredients) {
    if (typeof ingredient.name != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType",
        message: `Ingredient object name fields must be strings.`,
      });
    }
    if (typeof ingredient.measurementUnit != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType",
        message: `Ingredient object measurementUnit fields must be strings.`,
      });
    }
    if (typeof ingredient.amount != "number") {
      return res.status(422).json({
        errorType: "IncorrectDataType",
        message: `Ingredient object amount fields must be numbers.`,
      });
    }
    if (ingredient.hasOwnProperty("abv")) {
      if (typeof ingredient.abv != "number") {
        return res.status(422).json({
          errorType: "IncorrectDataType",
          message: `Ingredient object abv fields must be numbers.`,
        });
      }
    }
  }

  //Trimmed Strings
  for (let ingredient of req.body.ingredients) {
    if (ingredient.name.trim().length < ingredient.name.length) {
      return res.status(422).json({
        errorType: "StringNotTrimmed",
        message: `Ingredient object name fields can not begin or end with whitespace.`
      })
    }
    if (ingredient.measurementUnit.trim().length < ingredient.measurementUnit.length) {
      return res.status(422).json({
        errorType: "StringNotTrimmed",
        message: `Ingredient object measurementUnit fields can not begin or end with whitespace.`
      })
    }
  }

  //Field sizing
  for(let ingredient of req.body.ingredients) {
    if(ingredient.amount<=0) {
      return res.status(422).json({
        errorType: "InvalidFieldSize",
        message: `Ingredient 'amount' field is less than its minimum.`
      });
    }
    if( ingredient.hasOwnProperty("abv") && (ingredient.abv<0||ingredient.abv>100) ) {
      return res.status(422).json({
        errorType: "InvalidFieldSize",
        message: `Ingredient 'abv' field is less than its minimum.`
      });
    }
  }


  //Cocktail Recipe creation
  Cocktail.create({
    name: req.body.name,
    creator: jwt.verify(req.cookies.session, JWT_SECRET).sub,
    ingredients: req.body.ingredients
  })
  .then( (newCocktailRecipe)=> {
    return res.status(201).json(newCocktailRecipe);
  })
  .catch( (err)=> {
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error.",
      err: err
    })
  });
});

//Update a specific cocktail recipe
router.put("/update", authorize, (req, res)=> {

  //targetId must be present
  if (!req.body.targetId) {
    return res.status(422).json({
      errorType: "MissingField",
      message: `No 'targetId' present in the request body.`
    });
  }

  //Either newName or newIngredients must be present
  if ((!req.body.newName || req.body.newName=="") && (!req.body.newIngredients || req.body.newIngredients==""))
  {
    return res.status(422).json({
      errorType: "NoActionableFields",
      message: `Request body has no actionable fields.`,
    });
  }

  //targetId must be a valid ObjectId
  if(!ObjectId.isValid(req.body.targetId)) {
    return res.status(422).json({
      errorType: "UnexpectedDataType",
      message: `The provided cocktail 'targetId' is an invalid ObjectId.`
    });
  }

  //newName must be a String
  if(typeof req.body.newName != "string") {
    return res.status(422).json({
      errorType: "UnexpectedDataType",
      message: `'name' field must be a string.`,
    });
  }

  //newIngredients must be an Array
  if(!Array.isArray(req.body.newIngredients)) {
    return res.status(422).json({
      errorType: "UnexpectedDataType",
      message: `'ingredients' field must be an Array.`,
    });
  }

  //newName must not begin or end with whitespace
  if(req.body.newName.trim().length < req.body.newName.length ) {
    return res.status(422).json({
      errorType: "StringNotTrimmed",
      message: `'newName' field can not begin or end with whitespace.`,
    });
  }

  const updateValues = {};

  if (req.body.newName) {
    updateValues.name = req.body.newName;
  }
  if (req.body.newIngredients) {
    updateValues.ingredients = req.body.newIngredients;
  }

  Cocktail.findOneAndUpdate({_id: req.body.targetId}, updateValues, {new:true})
  .then( (updatedCocktail)=> {
    if (updatedCocktail) {
      return res.status(200).json(updatedCocktail);
    }
    return res.status(404).json({
      errorType: "NoSuchCocktail",
      message: "No cocktail recipe exists with the specified targetId."
    })
  })
  .catch( (err)=> {
    console.error(`✖ ${err}`);
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});

//Delete a specific cocktail recipe
router.delete("/delete", authorize, (req, res)=> {

  //Request body contains 'targetId'
  if (!req.body.targetId) {
    return res.status(422).json({
      errorType: "MissingField",
      message: `No cocktail 'targetId' field in the request body.`
    });
  }

  //'targetId' is a valid ObjectId
  if(!mongoose.Types.ObjectId.isValid(req.body.targetId)) {
    return res.status(422).json({
      errorType: "InvalidObjectId",
      message: `The 'targetId' field is an invalid ObjectId.`
    });
  }

  let sessionUsername = jwt.verify(req.cookies.session, JWT_SECRET).sub;
  Cocktail.findOneAndDelete({_id: req.body.targetId, creator: sessionUsername})
  .then( (locatedCocktail)=> {
    if(!locatedCocktail) {
      return res.status(422).json({
        errorType: "NoSuchCocktail",
        message: "No cocktail recipe with the given 'targetId' belongs to the current session user."
      })
    }
    return res.status(200).json(locatedCocktail);
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});



module.exports = {
  router
};