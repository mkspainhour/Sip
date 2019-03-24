//#region SETUP
"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
  const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");

const { JWT_SECRET, COOKIE_EXPIRY } = require("../../config");
const { Cocktail } = require("./models");
const { User } = require("../user/models");
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
    //Required Fields
    for (let field of ["name", "ingredients"]) {
      if (!req.body[field]) {
        console.error(`Request is missing the '${field}' field.`);
        return res.status(422).json({
          errorType: "MissingField"
        });
      }
    };

    //String Types
    for(let stringField of ["name", "directions"]) {
      if(req.body[stringField] && typeof req.body[stringField] != "string") {
        console.error(`${stringField} field must be a String.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
    }

    //Array Types
    for(let arrayField of ["ingredients"]) {
      if(!Array.isArray(req.body[arrayField])) {
        console.error(`'${arrayField}' field must be an Array.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
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

    //Ingredient Field Data Types
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
        console.error(`Ingredient 'amount' fields must be a number.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
    }

    //Ingredient Field sizing
    for(let ingredient of req.body.ingredients) {
      if(ingredient.amount <= 0) {
        console.error(`Ingredient 'amount' field must be larger than 0.`);
        return res.status(422).json({
          errorType: "InvalidFieldSize"
        });
      }
    }
  //#endregion

  //Cocktail Recipe creation
  Cocktail.create({
    name: req.body.name,
    //Decoding instead of verifying as the jwt authorize middleware has already validated it.
    creator: jwt.decode(req.cookies.session).sub,
    ingredients: req.body.ingredients,
    directions: req.body.directions
  })
  .then((newCocktailRecipe)=> {
    return res.status(201).json(newCocktailRecipe.serialize());
  })
  .catch((err)=> {
    console.error(`❗Server Error:\n${err}\n`);
    return res.status(500).send();
  });
});

router.put("/update", authorize, (req, res)=> {
  //#region Request Validation
    //'targetId' must be present
    if (!req.body.targetId) {
      console.error(`No 'targetId' present in the request body.`);
      return res.status(422).json({
        errorType: "MissingField"
      });
    }

    //'targetId' must be a valid ObjectId
    if(!ObjectId.isValid(req.body.targetId)) {
      console.error(`The provided cocktail 'targetId' is an invalid ObjectId.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }

    //Either 'newName', 'newIngredients', or 'newDirections' must be present
    if (!req.body.newName && !req.body.newIngredients && !req.body.newDirections)
    {
      console.error(`No actionable fields provided in the request body.`);
      return res.status(422).json({
        errorType: "NoActionableFields"
      });
    }

    //'newName', if present, must be a String
    if(req.body.newName && typeof req.body.newName != "string") {
      console.error(`'name' field must be a string.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }

    //newIngredients, if present, must be an Array
    if(req.body.newIngredients && !Array.isArray(req.body.newIngredients)) {
      console.error(`'ingredients' field must be an Array.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
      });
    }

    //Required ingredient fields are present
    for (let ingredient of req.body.newIngredients) {
      for (let requiredField of ["name", "measurementUnit", "amount"]) {
        if (!ingredient[requiredField]) {
          console.error(`Ingredient is missing the '${requiredField}' field.`);
          return res.status(422).json({
            errorType: "MissingField"
          });
        }
      }
    }

    //Ingredient field data types are as expected
    for (let ingredient of req.body.newIngredients) {
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
        console.error(`Ingredient 'amount' field must be a number.`);
        return res.status(422).json({
          errorType: "IncorrectDataType"
        });
      }
    }

    //Ingredient fields adhere to model-specified sizing requirements
    for (let ingredient of req.body.newIngredients) {
      if(ingredient.amount <= 0) {
        console.error(`Ingredient 'amount' field must be larger than 0.`);
        return res.status(422).json({
          errorType: "InvalidFieldSize"
        });
      }
    }

    //'newDirections', if present, is a String
    if(req.body.newDirections && typeof req.body.newName != "string") {
      console.error(`'newDirections' field must be a String.`);
      return res.status(422).json({
        errorType: "UnexpectedDataType"
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
  //The purposeful deletion of directions is also accounted for
  if (req.body.newDirections || req.body.newDirections=="") {
    updateValues.directions = req.body.newDirections;
  }

  Cocktail.findOneAndUpdate({_id: req.body.targetId}, updateValues, {new:true})
  .then((cocktailRecipe)=> {
    if (!cocktailRecipe) {
      return res.status(404).json();
    }
    return res.status(200).json(cocktailRecipe.serialize());
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
    if(!ObjectId.isValid(req.body.targetId)) {
      console.error(`'targetId' is not a valid ObjectId`);
      return res.status(422).json({
        errorType: "InvalidObjectId"
      });
    }
  //#endregion

  let sessionUser = jwt.decode(req.cookies.session).sub;
  Cocktail.findOneAndDelete({_id: req.body.targetId, creator: sessionUser})
  .then( (deletedCocktail)=> {
    if(!deletedCocktail) {
      console.error("No cocktail recipe exists with both the provided 'targetId' and the current session user as its 'creator'.");
      return res.status(404).json({
        errorType: "NoSuchCocktail"
      });
    }
    return res.status(200).json(deletedCocktail);
  })
  .catch( (err)=> {
    console.error(`✖ ${err}`);
    return res.status(500).send();
  });
});

router.get("/:targetId", (req,res)=> {
  //#region Request Validation
    //':targetId' is a valid ObjectId
    if(!ObjectId.isValid(req.params.targetId)) {
      console.error(`The ':targetId' route parameter ${req.params.targetId} is an invalid ObjectId.`);
      return res.status(422).json({
        errorType: "InvalidObjectId"
      });
    }
  //#endregion

  Cocktail.findOne({_id: req.params.targetId})
  .then((requestedCocktail)=> {
    if(!requestedCocktail) {
      console.error("No cocktail recipe found with the requested ':targetId'.");
      return res.status(404).json({
        errorType: "NoSuchCocktail"
      });
    }
    return res.status(200).json(requestedCocktail.serialize());
  })
  .catch( (err)=> {
    console.error(`✖ ${err}`);
    return res.status(500).send();
  });
});



module.exports = {
  router
};