const recipeView = {
   //#region jQuery Selectors
   $view: $("#js-view-recipe"),
   $headerButtons: {
      $back: $("#js-headerButton-recipeBack"),
      $edit: $("#js-headerButton-recipeEdit")
   },

   $cocktailName: $("#js-recipe-cocktailName"),
   $ingredientsList: $("#js-recipe-ingredientsList"),
   $directions: $("#js-recipe-directions"),
   $directionsLabel: $("#recipe-directionsLabel"),
   //#endregion

   //#region Initial Values
   initialCocktailName: $("#js-recipe-cocktailName").text(),
   initialIngredientsList: $("#js-recipe-ingredientsList").text(),
   initialDirections: $("#js-recipe-directions").text(),
   //#endregion

   configureEventListeners: function() {
      ui.recipeView.$headerButtons.$back.on("click", async function(e){
         await ui.hideCurrentView("fadeOutRight");
         userHomeView.show("fadeInLeft");
      });

      ui.recipeView.$headerButtons.$edit.on("click", async function(e){
         alert("Feature to be implemented soon. 😘");
         //TODO: recipeView.$headerButtons.$edit click()
         // await ui.hideCurrentView("fadeOutLeft");
         // recipeEditView.show("EDIT", "fadeInRight");
      });
   },
   beforeShow: function() {
      return new Promise((resolve, reject)=> {
         ui.recipeView.reset();
         ui.recipeView.renderActiveCocktailRecipe();
         resolve();
      });
   },
   show: async function(showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await ui.recipeView.beforeShow();
      ui.showView(ui.recipeView, showAnimation);
   },
   reset: function() {
      ui.recipeView.$cocktailName.text( ui.recipeView.initialCocktailName );
      //TEMP
      // ui.recipeView.$creator.text( ui.recipeView.initialCreator );
      ui.recipeView.$ingredientsList.html( ui.recipeView.initialIngredientsList );
      ui.recipeView.$directions.text( ui.recipeView.initialDirections );
   },

   renderActiveCocktailRecipe: function() {
      const activeCocktail = appSession.activeCocktail;

      //Set cocktail name
      ui.recipeView.$cocktailName.text( activeCocktail.name );

      //TEMP
      //Set cocktail creator
      // ui.recipeView.$creator.text( activeCocktail.creator );

      //Build and add each ingredient
      activeCocktail.ingredients.forEach((ingredient, index, array)=> {
         const composedListItem = ui.recipeView.buildIngredientListItem(ingredient.amount, ingredient.measurementUnit, ingredient.name);
         ui.recipeView.$ingredientsList.append( composedListItem );
      });

      //Set cocktail directions, if the cocktail includes them
      if(activeCocktail) {
         ui.recipeView.$directionsLabel.show();
         ui.recipeView.$directions.text( activeCocktail.directions );
      }
      //Otherwise, hide the directions label
      else {
         ui.recipeView.$directionsLabel.hide();
      }
   },
   buildIngredientListItem: function(amount, measurementUnit, name) {
      return `<li class="ingredient typo-body"><span class="ingredientAmount">${amount}</span> <span class="ingredientMeasurementUnit">${measurementUnit}</span> — <span class=".ingredientName">${name}</span></li>`;
   },
};