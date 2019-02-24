//#region SETUP
"use strict";

const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");
const faker = require("faker");

const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { Cocktail } = require("../api/cocktail");
const { User } = require("../api/user");
//#endregion

const preexistingCocktail = {
  name: "Database Seeding Negroni",
  creator: "The_First_User",
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



describe("\n\n====Cocktail API====\n", function() {
  //#region HOOKS
    // Each hook function needs to either return a promise or invoke a `done()` callback.
    before("Starting server...",function() {
      return startServer(TEST_DATABASE_URL);
    });

    beforeEach("Seeding collection with test document", function() {
      return Cocktail.create( preexistingCocktail )
      .then( (cocktailRecipe)=> {
        preexistingCocktail._id = cocktailRecipe._id
      });
    })

    afterEach("Clearing test-added documents...", function() {
      return mongoose.connection.dropCollection("cocktails");
    })

    after("Stopping server...", function() {
      return stopServer();
    });
  //#endregion

  describe("POST /create 🔒", function() {

    it("Fail state: no 'session' cookie exists", function() {
      return chai.request(app)
      .post("/api/cocktail/create")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").that.equals("NoActiveSession");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").that.equals("MalformedJWT");
      })
    });

    it("Fail state: 'name' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        //name = "",
        ingredients: [
          {
            name: "water",
            measurementUnit: "part",
            amount: 1
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        console.log("ERROR", res.body);
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").that.equals("MissingField");
      });
    });

    it("Fail state: 'name' field is not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: 32,
        ingredients: [
          {
            name: "water",
            measurementUnit: "part",
            amount: 1
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").that.equals("IncorrectDataType");
      });
    });

    it("Fail state: 'ingredients' array field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: "",
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").that.equals("MissingField");
      });
    });

    it("Fail state: 'ingredients' field is not a valid Array", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: 12,
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").that.equals("IncorrectDataType");
      });
    });

    it("Fail state: ingredient 'amount' field is missing", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: "Super Cool Drinkeroony",
        ingredients: [
          {
            name:"Water",
            measurementUnit:"part",
            amount:1
          },
          {
            name: "Not Water",
            //amount:2.5,
            measurementUnit: "ounces"
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'amount' field is not a Number", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount: "two and a half",
            measurementUnit: "ounces"
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("IncorrectDataType");
      });
    });

    it("Fail state: ingredient 'amount' field is less than 0", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount: -2.5,
            measurementUnit: "ounces"
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("InvalidFieldSize");
      });
    });

    it("Fail state: ingredient 'measurementUnit' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount:2.5,
            //measurementUnit: ""
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'measurementUnit' field is not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount: 2.5,
            measurementUnit: false
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'name' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            //name: ""
            measurementUnit: "ounces",
            amount: 2.5
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'name' field is not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: 32,
            amount: 2.5,
            measurementUnit: "ounces"
          }
        ],
        directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("IncorrectDataType");
      });
    });

    it("Fail state: 'directions' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount:2.5,
            measurementUnit: ""
          }
        ],
        //directions: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Success: create a new cocktail", function() {
      const preparedCocktail = {
        name: "Negroni",
        ingredients: [
          {
            amount:1,
            measurementUnit: "part",
            name:"Gin"
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
        ],
        directions: "Just mix the dang thing."
      }
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: preparedCocktail.name,
        ingredients: preparedCocktail.ingredients,
        directions: preparedCocktail.directions
      })
      .then( function(res) {
        expect(res).to.have.status(201).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("name").that.equals(preparedCocktail.name);
        expect(res.body).to.have.property("ingredients").that.deep.equals(preparedCocktail.ingredients);
        expect(res.body).to.have.property("directions").that.equals(preparedCocktail.directions);
      });
    });

  });

  describe("PUT /update 🔒", function() {

    it("Fail state: no 'session' cookie exists", function() {
      return chai.request(app)
      .put("/api/cocktail/update")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").that.equals("NoActiveSession");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").that.equals("MalformedJWT");
      })
    });

    it("Fail state: 'targetId' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        //targetId: preexistingCocktail._id,
        newName: "Updated Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: 'targetId' is not a valid ObjectId", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id + "GARBAGE_CHARACTERS",
        newName: "Updated Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("UnexpectedDataType");
      });
    });

    it("Fail state: 'targetId' does not point to an existing Cocktail Recipe", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        //There is an EXTREMEMLY small chance that the following generates an ObjectId that's already in use. In the MASSIVELY UNLIKELY event that this test fails, I encourage a second run to ensure that such an edge-case was not the culprit.
        targetId: ObjectId(),
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1,
            abv: 0
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(404).and.to.be.json;
      });
    });

    it("Fail state: 'newName', 'newIngredients', and 'newDirections' fields are missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        // newName: "Updated Cocktail Name",
        // newIngredients: [
        //   {
        //     name: "Water",
        //     measurementUnit: "part",
        //     amount: 1,
        //     abv: 0
        //   }
        // ],
        // newDirections: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("NoActionableFields");
      });
    });

    it("Fail state: 'newName' is present, but not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: 32,
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("UnexpectedDataType");
      });
    });

    it("Fail state: 'newIngredients' is present, but not an Array", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: "ingredient1,ingredient2,ingredient3",
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("UnexpectedDataType");
      });
    });

    it("Fail state: ingredient 'amount' field is missing", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            //amount: 2.5,
            measurementUnit: "ounces"
          }
        ],
        newDirections: "Just mix the dang thing."
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'amount' field is not a Number", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount: "two and a half",
            measurementUnit: "ounces"
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("IncorrectDataType");
      });
    });

    it("Fail state: ingredient 'amount' field is less than 0", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount: -2.5,
            measurementUnit: "ounces"
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("InvalidFieldSize");
      });
    });

    it("Fail state: ingredient 'measurementUnit' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount:2.5,
            //measurementUnit: ""
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'measurementUnit' field is not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: "Not Water",
            amount: 2.5,
            measurementUnit: false
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'name' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: faker.random.words(),
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            //name: ""
            measurementUnit: "ounces",
            amount: 2.5
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: ingredient 'name' field is not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: 32,
            amount: 2.5,
            measurementUnit: "ounces"
          }
        ],
        newDirections: "New Directions"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("IncorrectDataType");
      });
    });

    it("Fail state: 'newDirections' is present, but not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          },
          {
            name: 32,
            amount: 2.5,
            measurementUnit: "ounces"
          }
        ],
        newDirections: 4
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("IncorrectDataType");
      });
    });

    it("Success: the targeted cocktail recipe is updated", function() {
      const updateData = {
        targetId: preexistingCocktail._id,
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1
          }
        ],
        newDirections: "New Directions"
      }
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send(updateData)
      .then( function(res) {
        expect(res).to.have.status(200).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("_id").that.equals(updateData.targetId.toString());
        expect(res.body).to.have.property("name").that.equals(updateData.newName);
        expect(res.body).to.have.property("creator").that.equals(jwt.decode(sessionJwt).sub);
        expect(res.body).to.have.property("ingredients").and.to.deep.equal(updateData.newIngredients);
        expect(res.body).to.have.property("directions").that.equals(updateData.newDirections);
      });
    });

  });

  describe("POST /delete 🔒", function() {

    it("Fail state: no 'session' cookie exists", function() {
      return chai.request(app)
      .delete("/api/cocktail/delete")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").that.equals("NoActiveSession");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").that.equals("MalformedJWT");
      })
    });

    it("Fail state: 'targetId' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .delete("/api/cocktail/delete")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: ""
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("MissingField");
      });
    });

    it("Fail state: 'targetId' field is not a valid ObjectId", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .delete("/api/cocktail/delete")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id + "GARBAGEcharacters"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("InvalidObjectId");
      });
    });

    it("Fail state: 'targetId' and the current session user do not share a known cocktail", function() {
      //Prepare session for nonsense user
      const sessionJwt = User.makeJwtFor(faker.internet.userName());

      return chai.request(app)
      .delete("/api/cocktail/delete")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id
      })
      .then( function(res) {
        expect(res).to.have.status(404).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").that.equals("NoSuchCocktail");
      });
    });

    it("Success: the cocktail with the id 'targetId', created by the current session user, was deleted", function() {
      //Prepare session for nonsense user
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .delete("/api/cocktail/delete")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: preexistingCocktail._id
      })
      .then( function(res) {
        expect(res).to.have.status(200).and.to.be.json;
        expect(res.body).to.be.an("object");
        //TODO: Test Improvement: /api/cocktail/delete
        //Attempt to GET deleted cocktail recipe and ensure that it's deleted
      });
    });

  });

  describe("GET /:targetId", function() {

    it("Fail state: ':targetId' is an invalid ObjectId", function() {
      return chai.request(app)
      .get(`/api/cocktail/${preexistingCocktail._id+"GARBAGEdata"}`)
      .then( (res)=> {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType").that.equals("InvalidObjectId");
      });
		});

		it("Success: the requested cocktail recipe is returned", function() {
      return chai.request(app)
      .get(`/api/cocktail/${preexistingCocktail._id}`)
      .then( (res)=> {
        expect(res).to.have.status(200).and.to.be.json;
        expect(res.body).to.be.an("object");

				expect(res.body).to.have.property("id").that.equals(preexistingCocktail._id.toString());
        expect(res.body).to.have.property("creator").that.equals(preexistingCocktail.creator);
        expect(res.body).to.have.property("ingredients").that.deep.equals(preexistingCocktail.ingredients);
        expect(res.body).to.have.property("directions").that.equals(preexistingCocktail.directions);
      });
    });

  });

});