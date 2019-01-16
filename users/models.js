'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;



// SCHEMA DEFINITION
//
const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true, trim: true},
  hashedPassword: {type: String, required: true},
  email: {type: String, unique: true, trim: true, default: ""},
  cocktails: [{type: mongoose.Schema.Types.ObjectId, ref: "Cocktail"}],
  //suggestions: [{type: mongoose.Schema.Types.ObjectId, ref: "Suggestion"} ]
  //createdAt
  //updatedAt
}, {timestamps: true});



// STATIC MODEL METHOD
//
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 11);
};



// MODEL INSTANCE METHODS
//
userSchema.methods.publicInfo = function() {
  return {
    username: this.username,
    registerDate: this.createdAt,
  };
};

userSchema.methods.privateInfo = function() {
  return {
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}



// MODEL DECLARATION
//
const User = mongoose.model('user', userSchema);



// EXPORTS
//
module.exports = {
  User
};