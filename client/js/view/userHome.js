const userHomeView = {
   //#region jQuery Selectors
   $view: $("#js-view-userHome"),
   $headerButtons: {
      $signOut: $("#js-headerButton-signOut"),
      $addRecipe: $("#js-headerButton-addRecipe")
   },

   $activeUser: $("#js-userHome-text-currentUser"),
   $recipeCount: $("#js-userHome-text-recipeCount"),
   $recipeCardsWrapper: $("#js-userHome-wrapper-recipeCards"),
   //#endregion

   //#region State Variables
   scrollPosition: null,
   //#endregion

   //#region Initial Values
   initialActiveUserText: $("#js-userHome-text-currentUser").text(),
   initialRecipeCountText: $("#js-userHome-text-recipeCount").text(),
   //#endregion

   configureEventListeners: function() {
      userHomeView.$headerButtons.$signOut.on("click", function(e) {
         userHomeView.signOut();
      });

      userHomeView.$headerButtons.$addRecipe.on("click", async function(e) {
         userHomeView.cacheScrollPosition();
         await ui.hideCurrentView("fadeOutLeft");
         recipeEditView.show("CREATE", "fadeInRight");
      });

      userHomeView.$recipeCardsWrapper.on("click", ".recipe-card", async function(e) {
         //Isolates 'n' from the element id 'recipe-card-n'
         const selectedCardId = e.currentTarget.id.replace("recipe-card-", "");

         appSession.activeCocktail = appSession.userCocktails[selectedCardId];
         userHomeView.cacheScrollPosition();

         await ui.hideCurrentView("fadeOutLeft");
         ui.recipeView.show("fadeInRight");
      });
   },
   beforeShow: function() {
      return new Promise(async (resolve, reject)=> {
         //Collect information about the current session user
         let userInformation = await userHomeView.getUserInformation(appSession.user);

         //Set the active username display
         userHomeView.$activeUser.text(appSession.user);

         //Set recipe count display
         if (userInformation.createdCocktails.length === 1) {
            userHomeView.$recipeCount.text("1 Recipe");
         }
         else {
            userHomeView.$recipeCount.text(`${userInformation.createdCocktails.length} Recipes`)
         }

         //Render the users cocktail recipes as cards
         userHomeView.renderRecipeCards( userInformation.createdCocktails );

         resolve();
      });
   },
   show: async function(showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await userHomeView.beforeShow();
      ui.showView(userHomeView, showAnimation);
      window.scrollTo(0, userHomeView.priorScrollPosition||0);
   },
   reset: function() {
      userHomeView.scrollPosition = null;
      userHomeView.$activeUser.text(userHomeView.initialActiveUserText);
      userHomeView.$recipeCount.text(userHomeView.initialRecipeCountText);
   },

   buildRecipeCard: function(cardIndex, recipeName, ingredientNames) {
      return `
         <div id="recipe-card-${cardIndex}" class="recipe-card">
            <h3 id="recipe-card-name" class="recipe-name typo-heading-small typo-color-orange">${recipeName}</h3>
            <p id="recipe-card-ingredientNames" class="ingredients-list typo-body-small">${ingredientNames}</p>
            <img src="resources/icons/chevron_right.svg" class="svg-icon svg-show-recipe-chevron" alt="View cocktail recipe...">
         </div>`;
   },
   renderRecipeCards: function(recipesToRender) {
      let constructedRecipeCards = [];

      recipesToRender.forEach((currentRecipe, index)=> {
         //Compose a comma-separated list of recipe ingredient names
         const ingredientNames = currentRecipe.ingredients.map((ingredient)=> {return ingredient.name}).join(", ");
         //Build Recipe Card
         const recipeCard = userHomeView.buildRecipeCard(index, currentRecipe.name, ingredientNames);
         //Push constructed recipe card to storage array
         constructedRecipeCards.push( recipeCard );
      });

      //.join("") combines the array of independed HTML elements into a large HTML chunk that can be inserted at once.
      userHomeView.$recipeCardsWrapper.html( constructedRecipeCards.join("") );
   },
   cacheScrollPosition: function() {
      userHomeView.scrollPosition = window.scrollY;
   },

   //API
   getUserInformation: function(targetUsername) {
      return new Promise((resolve, reject)=> {
         $.ajax({
            method: "GET",
            url: `/api/user/${targetUsername}`
         })
         .then((userInformation)=> {
            appSession.userCocktails = userInformation.createdCocktails;
            resolve(userInformation);
         })
         .catch(async (error)=> {
            const response = error.responseJSON;
            const errorType = response.errorType;
            console.error("ERROR:", response);

            switch(errorType) {
               case "NoSuchUser":
                  alert("ERROR: NoSuchUser");
                  //The user is both signed in, and nonexistent. This can only happen if the user tampers with their cookies, so the session is deemed invalid and the user is forcibly 'signed out', clearing all active cookies.
                  userHomeView.signOut();
                  break;
               default:
                  alert("ERROR: Get User Information enountered an unexpected error.");
                  break;
            }
         });
      });
   },
   signOut: function() {
      return new Promise((resolve, reject)=> {
         $.ajax({
            method: "GET",
            url: "/api/auth/sign-out"
         })
         .then(async ()=> {
            appSession.reset();
            ui.reset();

            await ui.hideCurrentView("fadeOutRight")
            landingView.show("fadeInLeft");

            resolve();
         });
      });
   },
};