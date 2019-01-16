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
      name: {type: String, required: true, trim: true},
      measurementUnit: {type: String, required: true, trim: true, lowercase: true},
      amount: {type: String, required: true, trim: true},
      abv: {type: Number, min: 0, max: 100}
    }],
    required: true,
    default: {
      name: "Water",
      measurementUnit: "part",
      amount: 1,
      abv: 0
    }
  }
  //suggestions: [{type: mongoose.Schema.Types.ObjectId, ref: "Suggestion"}]
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
const Cocktail = mongoose.model('cocktail', cocktailSchema);



// EXPORTS
//
module.exports = {
  Cocktail
};