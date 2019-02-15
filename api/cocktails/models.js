"use strict";
//#region SETUP
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const moment = require("moment");
//#endregion



const cocktailSchema = mongoose.Schema({
  name: {type: String, required: true, trim: true},
  creator: {type: String, required: true, trime: true},
  ingredients: {
    type: [{
      _id: false,
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



cocktailSchema.methods.totalAbv = function() {
  let round = function(value, precision) {
    let multiplier = Math.pow(10, precision||0);
    return Math.round(value * multiplier) / multiplier;
  }
  let abvSum = 0;
  let numberOfAlcoholicIngredients = 0;

  this.ingredients.forEach(function(ingredient) {
    if(ingredient.abv && ingredient.abv > 0) {

      abvSum += (ingredient.abv * ingredient.amount);
      numberOfAlcoholicIngredients += ingredient.amount;
    }
  });

  const rawAbv = abvSum / numberOfAlcoholicIngredients;

  return round(rawAbv, 1);
};

cocktailSchema.methods.ingredientNames = function() {
  let ingredientNames = this.ingredients.map((ingredient)=> {
    return ingredient.name;
  });

  //Returns a comma-separated list of ingredient names as a string
  return ingredientNames.join(", ");
}

cocktailSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    creator: this.creator,
    ingredientNames: this.ingredientNames(),
    ingredients: this.ingredients,
    abv: this.totalAbv(),
    recipeAge: moment(this.createdAt).fromNow(true)
  }
}



const Cocktail = mongoose.model("Cocktail", cocktailSchema);



module.exports = {
  Cocktail
};