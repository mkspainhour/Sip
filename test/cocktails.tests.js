"use strict";
//#region SETUP
const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
const faker = require("faker");

const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { Cocktail } = require("../api/cocktails");
const { User } = require("../api/users");
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
  ]
}



describe("\n====cocktail Endpoint====\n", function() {
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

  describe("POST /api/cocktail/create 🔒", function() {

    it("Fail state: no 'session' cookie exists", function() {
      return chai.request(app)
      .post("/api/cocktail/create")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("Unauthorized");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("MalformedJWT");
      })
    });

    it("Fail state: 'name' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        //name = "",
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").and.to.equal("MissingField");
      });
    });

    it("Fail state: 'name' field is not a String", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: 32,
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").and.to.equal("IncorrectDataType");
      });
    });

    it("Fail state: 'name' field begins or ends with whitespace", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: "_ Super Cool Drinkeroony      ",
        ingredients: [{name:"water",measurementUnit:"part",amount:1,abv:0}]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("StringNotTrimmed");
      });
    });

    it("Fail state: 'ingredients' array field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: ""
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").and.to.equal("MissingField");
      });
    });

    it("Fail state: 'ingredients' field is not a valid Array", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: 12
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").to.be.a("string").and.to.equal("IncorrectDataType");
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
            amount:1,
            abv:0
          },
          {
            name: "Not Water",
            //amount:2.5,
            measurementUnit: "ounces",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
      });
    });

    it("Fail state: ingredient 'amount' field is not a number", function() {
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
            amount: 1,
            abv: 0
          },
          {
            name: "Not Water",
            amount: "two and a half",
            measurementUnit: "ounces",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("IncorrectDataType");
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
            measurementUnit: "ounces",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("InvalidFieldSize");
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
            amount: 1,
            abv: 0
          },
          {
            name: "Not Water",
            amount:2.5,
            //measurementUnit: "",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
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
            amount: 1,
            abv: 0
          },
          {
            name: "Not Water",
            amount: 2.5,
            measurementUnit: false,
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
      });
    });

    it("Fail state: ingredient 'measurementUnit' field begins or ends with whitespace", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name:"Water",
            measurementUnit:"part",
            amount:1
          },
          {
            name: "Not Water",
            amount: 2.5,
            measurementUnit: " ounces ",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("StringNotTrimmed");
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
            amount: 1,
            abv: 0
          },
          {
            //name: ""
            measurementUnit: "ounces",
            amount: 2.5,
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
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
            amount: 1,
            abv: 0
          },
          {
            name: 32,
            amount: 2.5,
            measurementUnit: "ounces",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("IncorrectDataType");
      });
    });

    it("Fail state: ingredient 'name' field begins or ends with whitespace", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: faker.random.words(),
        ingredients: [
          {
            name:"Water",
            measurementUnit:"part",
            amount:1
          },
          {
            name: " Not Water ",
            amount: 2.5,
            measurementUnit: "ounces",
            abv: 25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("StringNotTrimmed");
      });
    });

    it("Fail state: ingredient 'abv' field is not a Number", function() {
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
            measurementUnit: "ounces",
            abv: "25 percent"
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("IncorrectDataType");
      });
    });

    it("Fail state: ingredient 'abv' field is less than 0", function() {
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
            measurementUnit: "ounces",
            abv: -25
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("InvalidFieldSize");
      });
    });

    it("Fail state: ingredient 'abv' field exceeds 100", function() {
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
            measurementUnit: "ounces",
            abv: 125
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("InvalidFieldSize");
      });
    });

    it("Success: create a new cocktail", function() {
      const preparedCocktail = {
        name: "Negroni",
        ingredients: [
          {
            amount:1,
            measurementUnit: "part",
            name:"Gin",
            abv: 44
          },
          {
            amount: 1,
            measurementUnit: "part",
            name: "Campari",
            abv: 24
          },
          {
            amount: 1,
            measurementUnit: "part",
            name: "Sweet (Red) Vermouth",
            abv: 16
          }
        ]
      }
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .post("/api/cocktail/create")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        name: preparedCocktail.name,
        ingredients: preparedCocktail.ingredients
      })
      .then( function(res) {
        expect(res).to.have.status(201).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("name").and.to.equal(preparedCocktail.name);
        res.body.ingredients.forEach(function(ingredient, currentIndex) {
          let originalIngredient = preparedCocktail.ingredients[currentIndex];
          for(let field in originalIngredient) {
            expect(originalIngredient[field]).to.equal(ingredient[field]);
          }
        });
      });
    });

  });

  describe("PUT /api/cocktail/update 🔒", function() {

    it("Fail state: no 'session' cookie exists", function() {
      return chai.request(app)
      .put("/api/cocktail/update")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("Unauthorized");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("MalformedJWT");
      })
    });

    it("Fail state: 'id' field is missing or empty", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        //targetId: preexistingCocktail._id
        newName: "Updated Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1,
            abv: 0
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
      });
    });

    it("Fail state: 'newName' & 'newIngredients' fields are missing or empty", function() {
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
        // ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("NoActionableFields");
      });
    });

    it("Fail state: 'id' is not a valid ObjectId", function() {
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
            amount: 1,
            abv: 0
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("UnexpectedDataType");
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
            amount: 1,
            abv: 0
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("UnexpectedDataType");
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
        newIngredients: "ingredient1,ingredient2,ingredient3"
      })
      .then( function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("UnexpectedDataType");
      });
    });

    it("Fail state: 'targetId' does not point to an existing Cocktail Recipe", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send({
        targetId: ObjectId(),
        newName: "New Cocktail Name",
        newIngredients: [
          {
            name: "Water",
            measurementUnit: "part",
            amount: 1,
            abv: 0
          }
        ]
      })
      .then( function(res) {
        expect(res).to.have.status(404).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("NoSuchCocktail");
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
            amount: 1,
            abv: 0
          }
        ]
      }
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt}`)
      .send(updateData)
      .then( function(res) {
        expect(res).to.have.status(200).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("_id").and.to.equal(updateData.targetId.toString());
        expect(res.body).to.have.property("name").and.to.equal(updateData.newName);
        //Validate all returned ingredients
        res.body.ingredients.forEach(function(ingredient, currentIndex) {
          let originalIngredient = updateData.newIngredients[currentIndex];
          //Validate all fields in each ingredient
          for(let field in originalIngredient) {
            expect(originalIngredient[field]).to.equal(ingredient[field]);
          }
        });
      });
    });

  });

  describe("POST /api/cocktail/delete 🔒", function() {

    it("Fail state: no 'session' cookie exists", function() {
      return chai.request(app)
      .delete("/api/cocktail/delete")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("Unauthorized");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const sessionJwt = User.makeJwtFor(preexistingCocktail.creator);

      return chai.request(app)
      .put("/api/cocktail/update")
      .set("Cookie", `session=${sessionJwt.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("MalformedJWT");
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
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
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
        expect(res.body).to.have.property("errorType").and.to.equal("InvalidObjectId");
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
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType").and.to.equal("NoSuchCocktail");
      });
    });

    //success, deleted
    it("Success: the cocktail with the id 'targetId' created by the current session user was deleted", function() {
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
        //expect(res.body).to.have.property("errorType").and.to.equal("NoSuchCocktail");
      });
    });

  });

});