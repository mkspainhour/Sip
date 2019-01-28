"use strict";
//#region SETUP
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
//#endregion



const cocktailSchema = mongoose.Schema({
  name: {type: String, required: true, trim: true},
  creator: {type: String, required: true, trime: true},
  ingredients: {
    type: [{
      amount: {type: Number, required: true},
      measurementUnit: {type: String, required: true, trim: true},
      name: {type: String, required: true, trim: true},
      abv: {type: Number, min: 0, max: 100}
    }],
    required: true
  }
  //createdAt
  //updatedAt
}, {timestamps: true});



cocktailSchema.statics.getCocktailsFor =  function(username) {
  let locatedCocktails = [];
  Cocktail.find({username})
  .then( (cocktails)=> {
    locatedCocktails = cocktails;
  });
  return locatedCocktails;
};



cocktailSchema.methods.totalAbv = function() {
  let abvSum = 0;
  let numberOfAlcoholicIngredients = 0;

  this.ingredients.forEach(function(ingredient) {
    console.log(ingredient);
    if(ingredient.hasOwnProperty("abv") && ingredient.abv > 0) {
      abvSum += ingredient.abv;
      numberOfAlcoholicIngredients++;
    }
  });

  return summedAbv / numberOfAlcoholicIngredients;
};



const Cocktail = mongoose.model("Cocktail", cocktailSchema);



module.exports = {
  Cocktail
};