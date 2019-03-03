const ui = {
      $view_recipeEdit: $("#js-view-recipeCreate"),
         $headerButton_cancelRecipeCreate: $("#js-headerButton-recipeCreateCancel"),
         $headerButton_cancelRecipeEdit: $("#js-headerButton-recipeEditCancel"),
         $input_recipeCreateCocktailName: $("#js-input-recipeCreate-cocktailName"),
         $label_recipeCreateCocktailName: $("#js-label-recipeCreate-cocktailName"),
         $form_recipeCreate: $("#js-form-recipeCreate"),
         $button_addIngredientBlock: $("#js-button-recipeCreate-addIngredientBlock"),
         $wrapper_recipeCreateIngredientBlocks: $("#js-wrapper-recipeCreate-ingredientBlocks"),
         $button_recipeCreateFormSubmit: $("#js-button-recipeCreate-submit"),
         $button_saveEditedRecipe: $("js-button-recipeEdit-submit"),

      $view_recipe: $("#js-view-recipe"),
         $headerButton_recipeBack: $("#js-headerButton-recipeBack"),
         $headerButton_editRecipe: $("#js-headerButton-recipeEdit"),
   //#endregion

   //#region UI Variables

      //Recipe Create Form Valid Field Flags
      recipeCreateCocktailNameIsValid: false,
      recipeCreateIngredientBlocksAreValid: false,

      //Initial Values
         //Recipe Create View
         initialRecipeCreateIngredientBlocks: null,
         initialRecipeCreateCocktailNameLabel: null,
         initialIngredientBlockNameLabel: null,
         initialIngredientBlockAmountLabel: null,
         initialIngredientBlockUnitLabel: null,
         initialIngredientBlockAbvLabel: null,
   //#endregion

   //#region Functions

      //#region Setup Functions
         configureEventListeners: function() {
            //#region Recipe Create View
            ui.$headerButton_cancelRecipeCreate.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showUserHomeView("fadeInLeft");
            });

            ui.$form_recipeCreate.on("submit", function(e) {
               //Prevents unnecessary refreshing behavior.
               //The form's submit button interprets the submit event on behalf of the form element.
               e.preventDefault();
            });

            ui.$form_recipeCreate.on("input", function(e) {
               ui.validateRecipeCreateForm();
            });

            ui.$input_recipeCreateCocktailName.on("input", function(e) {
               ui.validateRecipeName();
            });

            ui.$wrapper_recipeCreateIngredientBlocks.on("click", ".wrapper-ingredientBlock-svg-remove", async function(e) {
               targetedIngredientBlock = e.currentTarget.parentElement;
               $(targetedIngredientBlock).slideUp(400, function() {
                  this.remove();
               });
            });

            ui.$wrapper_recipeCreateIngredientBlocks.on("input", ".recipeCreate-ingredientBlock", function(e) {
               ui.validateIngredientBlocks();
            });

            ui.$button_addIngredientBlock.on("click", function(e) {
               ui.recipeCreate_addIngredientBlock();
            });

            ui.$button_recipeCreateFormSubmit.on("click", function(e) {
               ui.buildRecipeCreateRequest();
            });
            //#endregion

            //#region Recipe View
            ui.$headerButton_recipeBack.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showUserHomeView("fadeInLeft");
            });

            ui.$headerButton_editRecipe.on("click", async function(e) {
               await ui.hideCurrentView("fadeOut");
               ui.showRecipeEditView(appSession.activeCocktail, "fadeIn");
            });
            //#endregion

            //#region Recipe Edit View
            ui.$headerButton_cancelRecipeEdit.on("click", async function(e) {
               await ui.hideCurrentView("fadeOut");
               ui.showRecipeView("fadeIn");
            });

            ui.$button_saveEditedRecipe.on("click", function(e) {
               console.log("saving edited recipe");
               ui.updateRecipe();
            });
            //#endregion
         },
      //#endregion

      //#region User Home View Functions
         beforeShowingUserHomeView: async function() {
            return new Promise(async (resolve, reject)=> {
               let userInformation = await ui.getUserInformation(appSession.user);
                  console.log("fetched userInformation:", userInformation);
               const cocktailCount = userInformation.createdCocktails.length;
               const cocktails = userInformation.createdCocktails;

               //Set active username
               ui.$text_activeUser.text(appSession.user);

               //Set recipe count
               if (cocktailCount === 1) {
                  ui.$text_recipeCount.text("1 Recipe");
               }
               else {
                  ui.$text_recipeCount.text(`${userInformation.createdCocktails.length} Recipes`)
               }

               //Render cocktail recipe cards
               ui.renderCocktailRecipeCards(cocktails);

               resolve();
            });
         },

         showUserHomeView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingUserHomeView();
            ui.showView(ui.$view_userHome, showAnimation, $("#js-headerButton-signOut, #js-headerButton-addRecipe"));

            window.scrollTo(0, ui.userHomeViewScrollPosition || 0);
         },

         //API Call
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
                  const errorStatus = error.status;
                  const response = error.responseJSON;
                  const errorType = response.errorType;
                  console.error("ERROR:", errorStatus, response);

                  switch(errorType) {
                     case "NoSuchUser":
                        alert("ERROR: NoSuchUser");
                        //The user is both signed in, and nonexistent. This can only happen if the user tampers with their cookies, so the session is deemed invalid and the user is forcibly 'signed out', clearing any active cookies.
                        ui.signOut();
                        break;
                     default:
                        alert("ERROR: Get User Information enountered an unexpected error.");
                        break;
                  }
               });
            });
         },

         buildCocktailRecipeCard: function(cardIndex, cocktailRecipeName, ingredientNames) {
            return `
               <div id="recipe-card-${cardIndex}" class="recipe-card">
                  <h3 id="recipe-card-name" class="recipe-name typo-heading-small typo-color-orange">${cocktailRecipeName}</h3>
                  <p id="recipe-card-ingredientNames" class="ingredients-list typo-body-small">${ingredientNames}</p>
                  <img src="resources/icons/chevron_right.svg" class="svg-icon svg-show-recipe-chevron" alt="View cocktail recipe...">
               </div>`;
         },

         renderCocktailRecipeCards: function(cocktails) {
            builtCocktails = [];
            cocktails.forEach((cocktail, index)=> {
               //Compose a comma-separated list of ingredient names
               cocktail.ingredientNames = cocktail.ingredients.map((ingredient)=> {return ingredient.name}).join(", ");
               builtCocktails.push( ui.buildCocktailRecipeCard(index, cocktail.name, cocktail.ingredientNames) )
            });

            $("#js-userHome-wrapper-recipeCards").html(builtCocktails.join(""));
         },

         //API Call
         signOut: function() {
            return new Promise((resolve, reject)=> {
               $.ajax({
                  method: "GET",
                  url: "/api/auth/sign-out"
               })
               .then(()=> {
                  appSession.reset();
                  ui.reset();

                  ui.hideCurrentView("fadeOutRight")
                  .then(()=> {
                     ui.showLandingView("fadeInLeft");
                     resolve();
                  });
               });
            });
         },

         saveUserHomeViewScrollPosition: function() {
            ui.userHomeViewScrollPosition = window.scrollY;
         },
      //#endregion

      //#region Recipe Create View
      beforeShowingRecipeCreateView: async function() {
         return new Promise((resolve, reject)=> {
            ui.resetRecipeCreateView();
            resolve();
         });
      },

      resetRecipeCreateView: function() {
         ui.resetCocktailNameField();
         ui.resetRecipeCreateIngredientBlocks();
      },

      resetCocktailNameField: function() {
         ui.$input_recipeCreateCocktailName.val("");
         ui.$label_recipeCreateCocktailName.text(ui.initialRecipeCreateCocktailNameLabel);
      },

      resetRecipeCreateIngredientBlocks: function() {
         ui.$wrapper_recipeCreateIngredientBlocks.html(ui.initialRecipeCreateIngredientBlocks);
      },

      showRecipeCreateView: async function(showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeCreateView();
         ui.showView(ui.$view_recipeCreate, showAnimation, ui.$headerButton_cancelRecipeCreate);
         window.scrollTo(0, 0);
      },

      recipeCreate_addIngredientBlock: async function() {
         //The new block's index begins as the number of existing ingredientBlocks
         let newBlockIndex = $(".recipeCreate-ingredientBlock").length;

         //However, depending on how the user has added and deleted blocks, an ingredientBlock with that index may already exist
         while( $(`#recipeCreate-ingredientBlock-${newBlockIndex}`).length ) {
            console.log(`#recipeCreate-ingredientBlock-${newBlockIndex} already exists. Incrementing ID and trying again.`)
            newBlockIndex++;
         }

         ingredientBlockTemplate = `
            <div id="recipeCreate-ingredientBlock-${newBlockIndex}" class="recipeCreate-ingredientBlock" style="display:none;">

               <div class="wrapper-ingredientBlock-svg-remove">
                  <img src="resources/icons/close.svg" class="svg-ingredientBlock-remove" alt="Remove ingredient.">
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-name">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-name" type="text" title="Ingredient name." aria-label="ingredient name" required>
                  <label id="js-label-recipeCreate-ingredientBlock-${newBlockIndex}-name" class="typo-body-small typo-color-orange">Ingredient Name</label>
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-amount">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-amount" type="number" min="0" title="Ingredient amount." aria-label="ingredient amount" required>
                  <label id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-amount" class="typo-body-small typo-color-orange">Ingredient Amount</label>
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-measurementUnit">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-measurementUnit" type="text" title="Ingredient measurement unit." aria-label="ingredient measurement unit" required>
                  <label id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-measurementUnit" class="typo-body-small typo-color-orange">Measurement Unit</label>
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-abv">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-abv" type="number" min="0" max="100" title="Ingredient ABV Percentage." aria-label="ingredient ABV">
                  <label id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-abv" class="typo-body-small typo-color-orange">ABV Percentage (Optional)</label>
               </div>
            </div>
         `;

         ui.$wrapper_recipeCreateIngredientBlocks.append(ingredientBlockTemplate);
         $(`#recipeCreate-ingredientBlock-${newBlockIndex}`).slideDown(400);
         ui.scrollToBottom(400);
      },

      validateRecipeName: function() {
         const cocktailName = ui.$input_recipeCreateCocktailName.val();
         ui.recipeCreateCocktailNameIsValid = false;

         if(!cocktailName) {
            ui.$label_recipeCreateCocktailName.addClass("invalid");
            ui.$label_recipeCreateCocktailName.text("Cocktail Name is blank.");
         }
         else if(cocktailName.trim().length != cocktailName.length) {
            ui.$label_recipeCreateCocktailName.addClass("invalid");
            ui.$label_recipeCreateCocktailName.text("Cocktail Name begins/ends in whitespace.");
         }
         else {
            ui.$label_recipeCreateCocktailName.removeClass("invalid");
            ui.$label_recipeCreateCocktailName.text(ui.initialRecipeCreateCocktailNameLabel);
            ui.recipeCreateCocktailNameIsValid = true;
         }
      },

      validateIngredientBlocks: function() {
         //TODO: validateIngredientBlock()
         const ingredientBlocks = [];

         //Create array of present ingredientBlock id's to be used as reference
         $(".recipeCreate-ingredientBlock").each((index, element)=> {
            ingredientBlocks.push("#"+element.id);
         });


            // let currentIngredientName = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-name`).val();
            // let currentIngredientAmount = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-amount`).val();
            // let currentIngredientMeasurementUnit = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-measurementUnit`).val();
            // let currentIngredientAbv = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-abv`).val();

            // console.log({
            //    currentIngredientName,
            //    currentIngredientAmount,
            //    currentIngredientMeasurementUnit,
            //    currentIngredientAbv
            // })

         console.log("located blocks:", ingredientBlocks);
      },

      validateRecipeCreateForm: function() {
         (ui.recipeCreateCocktailNameIsValid && ui.recipeCreateIngredientBlocksAreValid) ?
         ui.enableRecipeCreateSubmitButton()
         : ui.disableRecipeCreateSubmitButton();
      },

      disableRecipeCreateSubmitButton: function() {
         this.$button_recipeCreateFormSubmit.prop("disabled", true);
      },

      enableRecipeCreateSubmitButton: function() {
         this.$button_recipeCreateFormSubmit.prop("disabled", false);
      },

      buildRecipeCreateRequest: function() {
         //TODO: buildRecipeCreateRequest()
         const presentIngredientBlocks = $(".recipeCreate-ingredientBlock");
            console.log("Detected Ingredient Blocks:", presentIngredientBlocks);
         let cocktail = {};

         //Build cocktail from name and ingredient blocks...

         ui.createCocktail(cocktail);
      },

      //API Call
      createCocktail: function(cocktail) {
         //TODO: createCocktail()
      },
      //#endregion

      //#region Recipe View
      beforeShowingRecipeView: function() {
         return new Promise(async (resolve, reject)=> {
            ui.resetRecipeView();
            ui.renderRecipeView(appSession.activeCocktail);
            resolve();
         });
      },

      resetRecipeView: function() {
         //TODO: resetRecipeView()
      },

      renderRecipeView: function() {
         console.log("renderRecipeView():", appSession.activeCocktail.name);
         //TODO: renderRecipeView()
      },

      showRecipeView: async function(showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeView();
         ui.showView(ui.$view_recipe, showAnimation, $("#js-headerButton-recipeEdit, #js-headerButton-recipeBack"));
      },
      //#endregion

      //#region Recipe Edit View
      beforeShowingRecipeEditView: async function(recipe) {
         return new Promise((resolve, reject)=> {
            ui.resetRecipeEditView();
            ui.renderRecipeEditView(recipe);
            resolve();
         });
      },

      resetRecipeEditView: function() {
         //TODO: resetRecipeEditView()
      },

      renderRecipeEditView: function(recipe) {
         console.log("renderRecipeEditView():", appSession.activeCocktail.name);
         //TODO: renderRecipeEditView()
      },

      showRecipeEditView: async function(recipe, showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeEditView(recipe);
         ui.showView(ui.$view_recipeEdit, showAnimation, ui.$headerButton_cancelRecipeEdit);
      },

      //API Call
      updateRecipe: function() {
         //TODO: updateRecipe
      },
      //#endregion=

   //#endregion
};