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
  let abvSum = 0;
  let numberOfAlcoholicIngredients = 0;

  this.ingredients.forEach(function(ingredient) {
    console.log(ingredient);
    if(ingredient.hasOwnProperty("abv") && ingredient.abv > 0) {
      abvSum += ingredient.abv;
      numberOfAlcoholicIngredients++;
    }
  });

  return abvSum / numberOfAlcoholicIngredients;
};

cocktailSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    creator: this.creator,
    ingredients: this.ingredients,
    recipeAge: moment(this.createdAt).fromNow(true)
  }
}



const Cocktail = mongoose.model("Cocktail", cocktailSchema);



module.exports = {
  Cocktail
};