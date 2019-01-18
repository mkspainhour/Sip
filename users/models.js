'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;



const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true, trim: true},
  hashedPassword: {type: String, required: true},
  email: {type: String, unique: true, trim: true, default: ""},
  cocktails: [{type: mongoose.Schema.Types.ObjectId, ref: "Cocktail"}],
  //createdAt
  //updatedAt
}, {timestamps: true});



userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 11);
};



userSchema.methods.serialize = function() {
  return {
    username: this.username,
    cocktailRecipes: this.cocktails,
    registrationDate: this.createdAt,
  };
};



const User = mongoose.model('User', userSchema);



module.exports = {
  User
};