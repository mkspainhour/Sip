"use strict";

const express = require("express");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const router = express.Router();
const { Cocktail } = require("./models");



// ENDPOINTS
//
//Get stats on all available cocktail recipes
router.get("/", (req,res)=> {
  Cocktail.find({})
  .then( (cocktailRecipeList)=> {
    res.status(200).json({
      message: "OK",
      cocktailRecipeCount: cocktailRecipeList.length
    });
  })
  .catch( (err)=> {
    res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});

//Fetch a specific cocktail recipe
router.get("/:id", (req, res)=> {
  if( !mongoose.Types.ObjectId.isValid(req.params.id) ) {
    return res.status(422).json({
      errorType: "InvalidObjectId",
      message: `The provided cocktail id '${req.params.id}' is an invalid ObjectId.`
    })
  }

  //Return the requested cocktail recipe
  Cocktail.findOne( mongoose.Types.ObjectId(req.params.id) )
  .then( (cocktailRecipe)=> {
    if (cocktailRecipe) {
      return res.status(200).json({
        message: "OK",
        cocktailRecipe
      });
    }
    res.status(404).json({
      errorType: "CocktailRecipeNotFound",
      message: "No cocktail recipe found with the provided ID."
    })
  })
  .catch( (err)=> {
    console.log(err);
    res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
});

//Create a new cocktail recipe and attach it to the provided user identifier
//TODO: Write test suite for this endpoint
router.post("/", (req, res)=> {
  //#region Cocktail Recipe Validation
    //#region REQUIRED FIELDS
    let requiredFields = ["name", "creator", "ingredients"];
    for (let field of requiredFields) {
      if ( !req.body.hasOwnProperty(field) || req.body[field] == "") {
        return res.status(422).json({
          errorType: "MissingField",
          message: `Request is missing the '${field}' field.`,
        });
      }
    };
    //#endregion

    //#region DATA TYPES
    let stringFields = ["name"];
    for(let field of stringFields) {
      if(typeof req.body[field] != "string") {
        return res.status(422).json({
          errorType: "IncorrectDataType",
          message: `${field} field must be a string.`,
        });
      }
    }

    const objectIdFields = ["creator"];
    for(let field of objectIdFields) {
      if( !mongoose.Types.ObjectId.isValid(req.body[field]) ) {
        return res.status(422).json({
          errorType: "IncorrectDataType",
          message: `'${field}' field must be an ObjectId.`,
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
    //#endregion

    //#region TRIMMED STRINGS
    let trimmedFields = ["name"]
    for(let field of trimmedFields) {
      if(req.body[field].trim().length < req.body[field].length ) {
        return res.status(422).json({
          errorType: "StringNotTrimmed",
          message: `'${field}' field can not begin or end with whitespace.`,
        });
      }
    }
    //#endregion
  //#endregion

  //#region Ingredients List Validation
    //#region REQUIRED FIELDS
    requiredFields = ["name", "measurementUnit", "amount"];
    for (let ingredient of req.body.ingredients) {
      for (let field of requiredFields) {
        if ( !ingredient.hasOwnProperty(field) ) {
          return res.status(422).json({
            errorType: "MissingField",
            message: `Ingredient is missing the '${field}' field.`,
          });
        }
      }
    };
    //#endregion

    //#region DATA TYPES
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
    //#endregion

    //#region TRIMMED STRINGS
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
    //#endregion

    //#region FIELD SIZING
    const sizedFields = [
      {
        name:"name",
        minLength: 1,
      },
      {
        name:"measurementUnit",
        minLength: 1,
      }
    ];
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
      for(let field of sizedFields) {
        //Minimum size checks
        if (ingredient.hasOwnProperty(field.name) && field.hasOwnProperty("minLength")) {
          if (ingredient[field.name].trim().length < field.minLength) {
            return res.status(422).json({
              errorType: "InvalidFieldSize",
              message: `${field.name} does not meet its minimum length.`
            });
          }
        }
      }
    }
    //#endregion
  //#endregion

  Cocktail.create({
    name: req.body.name,
    creator: req.body.creator,
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

//TODO: Update a cocktail recipe
router.put("/:id", (req, res)=> {
  //BOOKMARK
  return res.status(200).json("newCocktail");
});

//TODO: Delete a cocktail recipe
router.delete("/:id", (req, res)=> {
  Cocktail.findOneAndDelete({_id: req.params.id})
  .then( ()=> {
    return res.sendStatus(204);
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({
      errorType: "InternalServerError",
      message: "Internal server error."
    });
  });
  //return res.status(200).json(("Successfuly deleted."));
});



// EXPORTS
//
module.exports = {
  router
};