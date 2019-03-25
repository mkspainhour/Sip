//#region SETUP
"use strict";

const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const bcrypt = require("bcryptjs");
const faker = require("faker");

const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { User } = require("../api/user");
const { Cocktail } = require("../api/cocktail");



let preexistingUser = {
  username: "seedUsername",
  hashedPassword: bcrypt.hashSync("seedPassword", 12),
  email: "seedEmail@domain.tld"
}
const preexistingCocktail = {
  name: "Database Seeding Negroni",
  creator: "seedUsername",
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
  ],
  directions: "Just mix the dang thing."
}
//#endregion



describe("\n====Auth API====\n", function() {
  //#region HOOKS
    before("Starting server...", function() {
      return startServer(TEST_DATABASE_URL);
    });

    beforeEach("Seeding collection with test documents", function() {
      //Default seed user
      return User.create(preexistingUser)
      .then( (user)=> {
        preexistingUser.id = user._id;
        return Cocktail.create(preexistingCocktail);
      })
      .then( (cocktail)=> {
        preexistingCocktail.id = cocktail._id;
      });
    });

    afterEach(`Clearing test-added documents...`, async function() {
      //Clear any test-added documents from the collection before moving on.
      await User.deleteMany({});
      await Cocktail.deleteMany({});
    });

    after("Stopping server...", function() {
      return stopServer();
    });
  //#endregion

  describe("POST /api/auth/sign-in", function() {

    it("Fail state: a 'session' cookie is already active", function() {
      const sessionJwt = User.makeJwtFor(preexistingUser.username);
      return chai.request(app)
      .post("/api/auth/sign-in")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        username: preexistingUser.username,
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(400).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("SessionAlreadyActive");
      });
    });

    it("Fail state: 'username' field is missing or empty", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: "",
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: 'username' field is not a string", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: 16,
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("UnexpectedDataType");
      });
    });

    it("Fail state: 'password' field is missing or empty", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: ""
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: 'password' field is not a string", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: 4
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("UnexpectedDataType");
      });
    });

    it("Fail state: 'username' and 'password' do not belong to an existing user", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password()
      })
      .then(function(res) {
        expect(res).to.have.status(404).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("NoSuchUser");
      });
    });

    it("Success: sets 'session' cookie", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        expect(res).to.have.cookie("session");
        expect(res).to.have.cookie("user");
      });
    });

  });

  describe("GET /api/auth/sign-out", function() {

    it("Success: clears 'session' cookie", function() {
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .get("/api/auth/sign-out")
      .set("Cookie", `session=${sessionJwt}`)
      .then( function(res) {
        expect(res).to.have.status(204);
        expect(res).to.not.have.cookie("session");
        expect(res).to.not.have.cookie("user");
      })
    });

  });

});