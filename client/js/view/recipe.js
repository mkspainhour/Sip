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
      recipeView.$headerButtons.$back.on("click", async function(e) {
         await ui.hideCurrentView("fadeOutRight");
         userHomeView.show("fadeInLeft");
         appSession.activeCocktail = null;
      });

      recipeView.$headerButtons.$edit.on("click", async function(e) {
         alert("Feature under construction. Pardon the sawdust. 😘");

         await ui.hideCurrentView("fadeOutLeft");
         recipeEditView.show("EDIT", "fadeInRight");
      });
   },
   beforeShow: function() {
      return new Promise((resolve, reject)=> {
         recipeView.reset();
         recipeView.renderActiveCocktailRecipe();
         resolve();
      });
   },
   show: async function(showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await recipeView.beforeShow();
      ui.showView(recipeView, showAnimation);
   },
   reset: function() {
      recipeView.$cocktailName.text( recipeView.initialCocktailName );
      recipeView.$ingredientsList.html( recipeView.initialIngredientsList );
      recipeView.$directions.text( recipeView.initialDirections );
   },

   renderActiveCocktailRecipe: function() {
      const activeCocktail = appSession.activeCocktail;

      //Set cocktail name
      recipeView.$cocktailName.text( activeCocktail.name );

      //Build and add each ingredient
      activeCocktail.ingredients.forEach((ingredient, index, array)=> {
         const composedListItem = recipeView.buildIngredientListItem(ingredient.amount, ingredient.measurementUnit, ingredient.name);
         recipeView.$ingredientsList.append( composedListItem );
      });

      //Set cocktail directions, if the cocktail includes them
      if(activeCocktail) {
         recipeView.$directionsLabel.show();
         recipeView.$directions.text( activeCocktail.directions );
      }
      //Otherwise, hide the directions label
      else {
         recipeView.$directionsLabel.hide();
      }
   },
   buildIngredientListItem: function(amount, measurementUnit, name) {
      return `<li class="ingredient typo-body"><span class="ingredientAmount">${amount}</span> <span class="ingredientMeasurementUnit">${measurementUnit}</span> — <span class=".ingredientName">${name}</span></li>`;
   },
};