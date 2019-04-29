//SECTION: Setup
"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");

const { User } = require("../user/models");
const { Cocktail } = require("./models");
const { JWT_SECRET, COOKIE_EXPIRY } = require("../../config");

//Middleware
function authorize(req, res, next) {
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





//SECTION: Routes
router.post("/create", authorize, (req, res)=> {
  //Request Validation

  //Required Fields
  for (let field of ["name", "ingredients"]) {
    if (!req.body[field]) {
      return res.status(422).json({
        errorType: "MissingField"
      });
    }
  }

  //String Types
  for(let stringField of ["name", "directions"]) {
    if(req.body[stringField] && typeof req.body[stringField] != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
  }

  //Array Types
  for(let arrayField of ["ingredients"]) {
    if(!Array.isArray(req.body[arrayField])) {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
  }

  //Required Ingredient Fields
  for (let ingredient of req.body.ingredients) {
    for (let requiredField of ["name", "measurementUnit", "amount"]) {
      if (!ingredient[requiredField]) {
        return res.status(422).json({
          errorType: "MissingField"
        });
      }
    }
  }

  //Ingredient Field Data Types
  for (let ingredient of req.body.ingredients) {
    if (typeof ingredient.name != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
    if (typeof ingredient.measurementUnit != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
    if (typeof ingredient.amount != "number") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
  }

  //Ingredient Field sizing
  for(let ingredient of req.body.ingredients) {
    if(ingredient.amount <= 0) {
      return res.status(422).json({
        errorType: "InvalidFieldSize"
      });
    }
  }

  //Cocktail Recipe creation
  Cocktail.create({
    name: req.body.name,
    //Decoding instead of verifying as the 'authorize' middleware has already validated the JWT.
    creator: jwt.decode( req.cookies.session ).sub,
    ingredients: req.body.ingredients,
    directions: req.body.directions
  })
  .then((newCocktailRecipe)=> {
    return res.status(201).json( newCocktailRecipe.serialize() );
  })
  .catch(()=> {
    return res.status(500).send();
  });
});

router.put("/update", authorize, (req, res)=> {
  //Request Validation

  //'targetId' must be present
  if (!req.body.targetId) {
    return res.status(422).json({
      errorType: "MissingField"
    });
  }

  //'targetId' must be a valid ObjectId
  if(!ObjectId.isValid(req.body.targetId)) {
    return res.status(422).json({
      errorType: "UnexpectedDataType"
    });
  }

  //Either 'newName', 'newIngredients', or 'newDirections' must be present
  if (!req.body.newName && !req.body.newIngredients && !req.body.newDirections)
  {
    return res.status(422).json({
      errorType: "NoActionableFields"
    });
  }

  //'newName', if present, must be a String
  if(req.body.newName && typeof req.body.newName != "string") {
    return res.status(422).json({
      errorType: "UnexpectedDataType"
    });
  }

  //newIngredients, if present, must be an Array
  if(req.body.newIngredients && !Array.isArray(req.body.newIngredients)) {
    return res.status(422).json({
      errorType: "UnexpectedDataType"
    });
  }

  //Required ingredient fields are present
  for (let ingredient of req.body.newIngredients) {
    for (let requiredField of ["name", "measurementUnit", "amount"]) {
      if (!ingredient[requiredField]) {
        return res.status(422).json({
          errorType: "MissingField"
        });
      }
    }
  }

  //Ingredient field data types are as expected
  for (let ingredient of req.body.newIngredients) {
    if (typeof ingredient.name != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
    if (typeof ingredient.measurementUnit != "string") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
    if (typeof ingredient.amount != "number") {
      return res.status(422).json({
        errorType: "IncorrectDataType"
      });
    }
  }

  //Ingredient fields adhere to model-specified sizing requirements
  for (let ingredient of req.body.newIngredients) {
    if(ingredient.amount <= 0) {
      return res.status(422).json({
        errorType: "InvalidFieldSize"
      });
    }
  }

  //'newDirections', if present, is a String
  if(req.body.newDirections && typeof req.body.newName != "string") {
    return res.status(422).json({
      errorType: "UnexpectedDataType"
    });
  }

  //Build updateValues object from request body
  const updateValues = {};

  if (req.body.newName) {
    updateValues.name = req.body.newName;
  }
  if (req.body.newIngredients) {
    updateValues.ingredients = req.body.newIngredients;
  }
  //User-deleted directions can read as ""
  if (req.body.newDirections || req.body.newDirections=="") {
    updateValues.directions = req.body.newDirections;
  }

  //Update the Cocktail Recipe
  Cocktail.findOneAndUpdate({_id: req.body.targetId}, updateValues, {new:true}) //Returns updated recipe
  .then((cocktailRecipe)=> {
    if (!cocktailRecipe) {
      //If the cocktail target doesn't exist
      return res.status(404).json();
    }
    return res.status(200).json( cocktailRecipe.serialize() );
  })
  .catch(()=> {
    return res.status(500).send();
  });
});

router.delete("/delete", authorize, (req, res)=> {
  //Request Validation

  //Request body contains 'targetId'
  if (!req.body.targetId) {
    return res.status(422).json({
      errorType: "MissingField"
    });
  }

  //'targetId' is a valid ObjectId
  if(!ObjectId.isValid(req.body.targetId)) {
    return res.status(422).json({
      errorType: "InvalidObjectId"
    });
  }

  //Find the cocktail recipe with the specified ID that was also created by the current session user
  let sessionUser = jwt.decode(req.cookies.session).sub;
  Cocktail.findOneAndDelete({_id: req.body.targetId, creator: sessionUser})
  .then( (deletedCocktail)=> {
    if(!deletedCocktail) {
      //If the target cocktail doesn't exist
      return res.status(404).json({
        errorType: "NoSuchCocktail"
      });
    }
    return res.status(200).json(deletedCocktail);
  })
  .catch(()=> {
    return res.status(500).send();
  });
});

router.get("/:targetId", (req,res)=> {
  //Request Validation

  //':targetId' is a valid ObjectId
  if(!ObjectId.isValid(req.params.targetId)) {
    return res.status(422).json({
      errorType: "InvalidObjectId"
    });
  }

  //Get the targeted cocktail recipe
  Cocktail.findOne({_id: req.params.targetId})
  .then((requestedCocktail)=> {
    if(!requestedCocktail) {
      //The targeted cocktail recipe doesn't exist
      return res.status(404).json({
        errorType: "NoSuchCocktail"
      });
    }
    return res.status(200).json(requestedCocktail.serialize());
  })
  .catch(()=> {
    return res.status(500).send();
  });
});





module.exports = {
  router
};