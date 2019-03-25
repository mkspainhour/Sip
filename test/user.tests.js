//#region SETUP
"use strict";

const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
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


describe("\n\n====User API====\n", function() {
  //#region HOOKS
    //Before first test
    before("Starting server...", function() {
      return startServer(TEST_DATABASE_URL);
    });

    //Before every test
    beforeEach("Seeding collection with test document...", function() {
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

    //After every test
    afterEach("Clearing test-added documents...", async function() {
      //Clear any test-added documents from the collections before moving on.
      await User.deleteMany({});
      await Cocktail.deleteMany({});
    })

    //After last test
    after("Stopping server...", function() {
      return stopServer();
    });
  //#endregion

  describe("POST /api/user/create", function() {

    it("Fail state: 'username' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        //username: "testUsername",
        password: "testPassword",
        email: "testEmail@domain.tld"
      })
      .then( (res)=> {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "MissingField");
      });
    });

    it("Fail state: username field is not a String", function() {
      const testData = {
        username: 36,
        password: "testPassword",
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
        expect(res.body).to.have.property("errorType", "UnexpectedDataType");
      });
    });

    it("Fail state: password field is missing or empty", function() {
      const testData = {
        username: "testUsername",
        //password: "",
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
      });
    });

    it("Fail state: password field is not a String", function() {
      const testData = {
        username: "testUsername",
        password: 6,
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
        expect(res.body).to.have.property("errorType", "UnexpectedDataType");
      });
    });

    it("Fail state: email field is present, but empty", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
        email: ""
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
      });
    });

    it("Fail state: email field is present, but not a String", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
        email: 9
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
        expect(res.body).to.have.property("errorType", "UnexpectedDataType");
      });
    });

    it("Fail state: 'username' is already in use by an existing user", function() {
      return chai.request(app)
      .post("/api/user/create")
      .send({
        username: preexistingUser.username,
        password: "uniquePassword",
        email: "localPart@domain.tld"
      })
      .then(function(res) {
        expect(res).to.have.status(422);
        expect(res.body.errorType).to.exist.and.to.be.a("string").and.to.equal("UsernameNotUnique");
      });
    });

    it("Fail state: 'email' is already in use by an existing user", function() {
      return chai.request(app)
      .post("/api/user/create")
      .send({
        username: "uniqueUsername",
        password: "uniquePassword",
        email: preexistingUser.email
      })
      .then(function(res) {
        expect(res).to.have.status(422);
        expect(res.body.errorType).to.exist.and.to.be.a("string").and.to.equal("EmailNotUnique");
      });
    });

    it("Success state: a new user is created", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
        email: "localPart@domain.tld"
      };

      return chai.request(app)
      .post(`/api/user/create`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res).to.have.cookie("session");
        expect(res).to.have.cookie("user");
        User.findOne({username: testData.username})
        .then( (locatedUser)=> {
          expect(locatedUser).to.have.property("username", testData.username);
          expect(locatedUser).to.have.property("hashedPassword");
          expect(bcrypt.compareSync(testData.password, locatedUser.hashedPassword)).to.be.true;
          expect(locatedUser).to.have.property("email", testData.email);
        })
      });
    });

  });

  describe("GET /user/:username", function() {

    it("Fail state: username does not exist", function() {
      return chai.request(app)
      .get(`/api/user/${faker.internet.userName()}`)
      .then( (res)=> {
        expect(res).to.have.status(404).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("NoSuchUser");
      });
    });

    it("Success: the requested user's public-facing information is returned", function() {
      return chai.request(app)
      .get(`/api/user/${preexistingUser.username}`)
      .then( (res)=> {
        expect(res).to.have.status(200).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username").that.equals(preexistingUser.username);
        expect(res.body).to.have.property("createdCocktails").that.is.an("array");

        //The test hooks seed the database with a single cocktail, created by our preexistingUser
        //These tests ensure that it was saved as expected
        const returnedPreexistingCocktail = res.body.createdCocktails[0];
        expect(returnedPreexistingCocktail.id).to.equal(preexistingCocktail.id.toString());
        expect(returnedPreexistingCocktail.name).to.equal(preexistingCocktail.name);
        expect(returnedPreexistingCocktail.creator).to.equal(preexistingCocktail.creator);
        expect(returnedPreexistingCocktail.ingredients).to.deep.equal(preexistingCocktail.ingredients);
        expect(returnedPreexistingCocktail.directions).to.equal(preexistingCocktail.directions);
      });
    });

	});

});