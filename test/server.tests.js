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
  sessionJwt: User.makeJwtFor("seedUsername"),
  username: "seedUsername",
  hashedPassword: bcrypt.hashSync("seedPassword", 12),
  email: "seedEmail@domain.tld"
}
const preexistingCocktail = {
   name: "Database Seeding Negroni",
   creator: "admin",
   ingredients: [
     {
       amount: 3,
       measurementUnit: "part",
       name: "Gin, dry"
     },
     {
       amount: 2,
       measurementUnit: "part",
       name: "Campari"
     },
     {
       amount: 2,
       measurementUnit: "part",
       name: "Sweet (Red) Vermouth"
     }
   ]
 }


describe("User Tests", function() {
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
      Cocktail.deleteMany({});
    });
  })

  //After last test
  after("Stopping server...", function() {
    return stopServer();
  });
  //#endregion

  describe("POST /user/create", function() {

   it("Fail state: username field is missing or empty", function() {
   const testData = {
      //username = "",
      hashedPassword: bcrypt.hashSync("testPassword", 12),
      email: "localPart@domain.tld"
   };
   const sessionJwt = User.makeJwtFor(preexistingUser.username);

   return chai.request(app)
   .post(`/api/user/create`)
   .set("Cookie", `session=${sessionJwt}`)
   .send(testData)
   .then( (res)=> {
      expect(res).to.have.status(422);
      expect(res).to.be.json;
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("errorType", "MissingField");
      expect(res.body).to.have.property("message").and.to.be.a("string");
   });
   });

  });

});