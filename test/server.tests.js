"use strict";
//#region SETUP
const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);

const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;

const bcrypt = require("bcryptjs");

const {TEST_DATABASE_URL} = require("../config");
const {app, startServer, stopServer} = require("../server");
const {User} = require("../api/users");
const {Cocktail} = require("../api/cocktails");
//#endregion
let preexistingUser = {
  //id
  username: "seedUsername",
  hashedPassword: bcrypt.hashSync("seedPassword", 12),
  email: "seedEmail@domain.tld"
}
const preexistingCocktail = {
	//id
  name: "Seed Negroni",
  creator: "seedUsername",
  ingredients: [
     {
       amount: 3,
       measurementUnit: "part",
       name: "Gin",
       abv: 44
     },
     {
       amount: 2,
       measurementUnit: "part",
       name: "Campari",
       abv: 26
     },
     {
       amount: 2,
       measurementUnit: "part",
       name: "Red Vermouth",
       abv: 16
     }
   ]
 }


describe("====Core Route Tests====", function() {
  //#region HOOKS
  //Before first test
  before("Starting server...", function() {
    return startServer(TEST_DATABASE_URL);
  });

  //Before every test
  beforeEach("Seeding collection with test document...", function() {
    //Default seed user
    return User.create(preexistingUser)
    .then((user)=> {
      preexistingUser.id = user._id;
      return Cocktail.create(preexistingCocktail);
    })
    .then((cocktail)=> {
      preexistingCocktail.id = cocktail._id;
    });
  });

  //After every test
  afterEach("Clearing test-added documents...", function() {
    //Clear any test-added documents from the collection before moving on.
    return User.deleteMany({})
    .then(()=> {
      return Cocktail.deleteMany({});
    });
  })

  //After last test
  after("Stopping server...", function() {
    return stopServer();
  });
  //#endregion

  describe("GET /user/:username", function() {

    it("Fail state: username field begins or ends in whitepsace", function() {
      return chai.request(app)
      .get(`/user/ ${preexistingUser.username} `)
      .then( (res)=> {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("UntrimmedString");
      });
    });

    it("Success: the requested user's public-facing information is fetched and returned", function() {
      return chai.request(app)
      .get(`/user/${preexistingUser.username}`)
      .then( (res)=> {
        expect(res).to.have.status(200).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username").that.equals(preexistingUser.username);
				expect(res.body).to.have.property("createdCocktails").that.is.an("array");
      });
    });

	});

	describe("GET /cocktail/:username", function() {

    it("Fail state: 'id' route parameter is an invalid ObjectId", function() {
      return chai.request(app)
      .get(`/cocktail/${preexistingCocktail.id+"GARBAGEdata"}`)
      .then( (res)=> {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("InvalidObjectId");
      });
		});

		it("Success: the requested cocktail recipe is fetched and returned", function() {
      return chai.request(app)
      .get(`/cocktail/${preexistingCocktail.id}`)
      .then( (res)=> {
        expect(res).to.have.status(200).and.to.be.json;
				expect(res.body).to.be.an("object");
				expect(res.body).to.have.property("id").that.equals(preexistingCocktail.id.toString());
        expect(res.body).to.have.property("creator").that.equals(preexistingUser.username);
        expect(res.body).to.have.property("ingredientNames").that.is.a("string").and.does.not.equal("");
        expect(res.body).to.have.property("ingredients").that.is.an("array");
        expect(res.body).to.have.property("abv").that.is.a("number").that.is.at.least(0);
      });
    });

  });

});