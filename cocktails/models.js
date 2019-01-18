'use strict';

const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;



// SCHEMA DEFINITION
//
const cocktailSchema = mongoose.Schema({
  name: {type: String, required: true, trim: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
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



// STATIC MODEL METHOD
//
// cocktailSchema.statics.staticMethod = function() {
//   return true;
// };



// MODEL INSTANCE METHODS
//
// cocktailSchema.methods.instanceMethod = function() {
//   return true;
// };



// MODEL DECLARATION
//
const Cocktail = mongoose.model('Cocktail', cocktailSchema);



// EXPORTS
//
module.exports = {
  Cocktail
};