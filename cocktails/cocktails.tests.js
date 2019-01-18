"use strict";

const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const faker = require("faker");



// DEPENDENCIES
//
const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { Cocktail } = require("../cocktails");



// HELPER DATA
//
const preexistingCocktail = {
  name: "testCocktailRecipe",
  creator: mongoose.Types.ObjectId(),
  ingredients: [
    {
      amount: 1.5,
      measurementUnit: "part",
      name: "Gin, dry"
    },
    {
      amount: 1,
      measurementUnit: "part",
      name: "Campari"
    },
    {
      amount: 1,
      measurementUnit: "part",
      name: "Sweet (Red) Vermouth"
    }
  ]
}



// TESTS
//
describe("\n====== Cocktails Endpoint ======\n", function() {

  //#region HOOKS
  // Each hook function needs to either return a promise or invoke a `done()` callback.
  before(function() {
    return startServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return Cocktail.create( preexistingCocktail )
    .then( (cocktailRecipe)=> {
      preexistingCocktail._id = cocktailRecipe._id
    });
  })

  afterEach(function() {
    return mongoose.connection.dropCollection("cocktails");
  })

  after(function() {
    return stopServer()
  });
  //#endregion



  // ENDPOINT TESTS
  //
  describe("GET /api/cocktails", function() {

    it("Return assorted data on cocktail recipes site-wide", function() {
      return chai.request(app).get("/api/cocktails")
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("cocktailRecipeCount");
        expect(res.body.cocktailRecipeCount).to.be.a("number");
        expect(res.body.cocktailRecipeCount).to.be.at.least(1);
      });
    });

  });

  describe("GET /api/cocktails/:id", function() {

    it("Rejects request when ':id' is not a valid ObjectId", function() {
      const attemptedId = "invalidId";
      return chai.request(app).get(`/api/cocktails/${attemptedId}`)
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect( mongoose.Types.ObjectId.isValid(attemptedId) ).to.equal(false);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidObjectId");
      });
    });

    it("Fails with a 404 when no cocktail recipe with the (valid) provided ObjectId exists", function() {
      return chai.request(app).get(`/api/cocktails/${mongoose.Types.ObjectId()}`)
      .then( function(res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("CocktailRecipeNotFound");
      });
    });

    it("Succeeds and returns a cocktail recipe when none of the prior fail conditions are met", function() {
      return chai.request(app).get(`/api/cocktails/${preexistingCocktail._id}`)
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("cocktailRecipe");
        expect(res.body.cocktailRecipe.name).to.equal(preexistingCocktail.name);
        //expect(res.body.cocktailRecipe.name).to.equal(preexistingCocktail.name);
      });
    });

  });

  describe("POST /api/cocktails", function() {

    it("Rejects a request if the 'name' field is missing or empty", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        creator: mongoose.Types.ObjectId(),
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField")
      });
    });

    it("Rejects a request if the 'creator' field is missing", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        name: "theCoolInterntPerson",
        //creator: mongoose.Types.ObjectId(),
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField")
      });
    });

    it("Rejects a request if the 'ingredients' field is missing", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        name: "theCoolInterntPerson",
        creator: mongoose.Types.ObjectId(),
        //ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField")
      });
    });

    it("Rejects a request if the 'name' field is not a String", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        name: 32,
        creator: mongoose.Types.ObjectId(),
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType")
      });
    });

    it("Rejects a request if the 'creator' field is not a valid ObjectId String", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        name: "Super Cool Drinkeroony",
        creator: "notAnObjectIdAtAll",
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType")
      });
    });

    it("Rejects a request if the 'ingredients' field is not a valid Array", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        name: "Super Cool Drinkeroony",
        creator: mongoose.Types.ObjectId(),
        ingredients: "cherryblossom"
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType")
      });
    });

    it("Rejects a request if the 'name' field begins or ends with whitespace", function() {
      return chai.request(app).post("/api/cocktails")
      .send({
        name: "  _ Super Cool Drinkeroony      ",
        creator: mongoose.Types.ObjectId(),
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("StringNotTrimmed")
      });
    });

    //BOOKMARK:
    // 422 if an ingredient is missing the 'name' field or it is empty
    // 422 if an ingredient is missing the 'measurementUnit' field or it is empty
    // 422 if an ingredient is missing the 'amount' field

    // 422 if an ingredient 'name' field is not a String
    // 422 if an ingredient 'measurementUnit' field is not a String
    // 422 if an ingredient 'amount' is not a Number
    // 422 if an ingredient has an 'abv' field, a it is not a Number

    // 422 if an ingredient 'name' is not trimmed
    // 422 if an ingredient 'measurementUnit' is not trimmed
    // 422 if an ingredient 'amount' is less than 0
    // 422 if an ingredient 'abv' is above 100 or less than 0

    // Otherwise, create a new user with a 201, and return the new account info
  })
});