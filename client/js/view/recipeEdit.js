const recipeEditView = {
   //#region jQuery Selectors
   $view: $("#js-view-recipeEdit"),
   $headerButtons: {
      $cancel: $("#js-headerButton-recipeEditCancel"),
   },

   //Form Elements
   $form: $("#js-view-recipeEdit"),
   $formFeedback: $("#js-recipeEdit-formFeedback"),
   $cocktailNameInput: $("#js-input-recipeEdit-cocktailName"),
   $cocktailNameLabel: $("#js-label-recipeEdit-cocktailName"),
   $directionsInput: $("#js-input-recipeEdit-directions"),
   $ingredientBlocksWrapper: $("#js-wrapper-recipeEdit-ingredientBlocks"),
   $addIngredientBlockButton: $("#js-button-recipeEdit-addIngredientBlock"),

   $editModeSubmitButton: $("#js-button-recipeEdit-editModeSubmit"),
   $createModeSubmitButton: $("#js-button-recipeEdit-createModeSubmit"),
   //#endregion

   //#region Initial Values
   initialFormFeedback: $("#js-recipeEdit-formFeedback").text(),
   initialCocktailNameLabel: $("#js-label-recipeEdit-cocktailName").text(),
   initialIngredientBlocksWrapper: $("#js-wrapper-recipeEdit-ingredientBlocks").html(),
   initialIngredientNameLabel: $("#js-label-recipeEdit-ingredientBlock-0-name").text(),
   initialIngredientAmountLabel: $("#js-label-recipeEdit-ingredientBlock-0-amount").text(),
   initialIngredientMeasurementUnitLabel: $("#js-label-recipeEdit-ingredientBlock-0-measurementUnit").text(),
   //#endregion

   //#region State Variables
   mode: null, //'EDIT' or 'CREATE'
   $activeSubmitButton: null,
   editModeTargetId: null,

   cocktailNameInputIsValid: false,
   ingredientBlockValidityFlags: [
      {
         nameIsValid: false,
         amountIsValid: false,
         measurementUnitIsValid: false
      }
   ],
   //#endregion

   configureEventListeners: function() {
      //Inputs wait a certain number of milliseconds before validating themselves to allow for user input to complete
      //Each input event handler deliberately shares this one timer
      let validationDelayTimer;
      const validationDelay = 200; //ms

      recipeEditView.$headerButtons.$cancel.on("click", async function(e) {
         //The 'mode' view variable is reset in the view's reset() method, so its current value is cached here to be used in the conditional below
         const mode = recipeEditView.mode;

         await ui.hideCurrentView("fadeOutRight");
         recipeEditView.reset();

         if (mode == "CREATE") {
            userHomeView.show("fadeInLeft");
         }
         else if (mode == "EDIT") {
            ui.recipeView.show("fadeInLeft");
         }
      });

      recipeEditView.$form.on("submit", function(e) {
         //Prevents unnecessary refreshing behavior.
         //The form's submit button interprets the submit event on behalf of the form element.
         e.preventDefault();
      });

      recipeEditView.$cocktailNameInput.on("input", function(e) {
         clearTimeout(validationDelayTimer);
         validationDelayTimer = setTimeout(function() {
            recipeEditView.validateCocktailNameField(e.target.id);
         }, validationDelay);
      });

      recipeEditView.$ingredientBlocksWrapper.on("input", ".js-input-ingredientBlock-name", function(e) {
         clearTimeout(validationDelayTimer);
         validationDelayTimer = setTimeout(function() {
            recipeEditView.validateIngredientNameField(e.target.id);
         }, validationDelay);
      });

      recipeEditView.$ingredientBlocksWrapper.on("input", ".js-input-ingredientBlock-amount", function(e) {
         clearTimeout(validationDelayTimer);
         validationDelayTimer = setTimeout(function() {
            recipeEditView.validateIngredientAmountField(e.target.id);
         }, validationDelay);
      });

      recipeEditView.$ingredientBlocksWrapper.on("input", ".js-input-ingredientBlock-measurementUnit", function(e) {
         clearTimeout(validationDelayTimer);
         validationDelayTimer = setTimeout(function() {
            recipeEditView.validateIngredientMeasurementUnitField(e.target.id);
         }, validationDelay);
      });

      recipeEditView.$addIngredientBlockButton.on("click", function(e) {
         recipeEditView.addIngredientBlock();
      });

      recipeEditView.$ingredientBlocksWrapper.on("click", ".wrapper-ingredientBlock-svg-remove", function(e) {
         const targetedIngredientBlock = e.currentTarget.parentElement;
         const targetedIngredientBlockIndex = e.currentTarget.parentElement.id.replace("recipeEdit-ingredientBlock-", "");

         //Slide-up and remove the 'closed' ingredientBlock
         $(targetedIngredientBlock).slideUp(400, function() {
            this.remove();
            recipeEditView.validateForm();
         });
         //Nullify its validity flags
         recipeEditView.ingredientBlockValidityFlags[targetedIngredientBlockIndex] = null;
      });

      recipeEditView.$editModeSubmitButton.on("click", function(e) {
         //TODO: $editModeSubmitButton
         alert("Edit Mode Submit Detected");
      });

      recipeEditView.$createModeSubmitButton.on("click", function(e) {
         const cocktailData = recipeEditView.getDataFromForm();
         recipeEditView.createCocktail( cocktailData );
      });
   },
   beforeShow: function(mode) {
      return new Promise((resolve, reject)=> {
         //Reset the view
         recipeEditView.reset();

         //Sterilize and format the provided 'mode'
         mode = mode.toUpperCase().trim();

         //Set the mode flag
         recipeEditView.mode = mode;

         //Prepare Edit Mode
         if (mode=="EDIT") {
            recipeEditView.setFormFeedback("Edit Recipe");
            recipeEditView.$createModeSubmitButton.hide();
            recipeEditView.$activeSubmitButton = recipeEditView.$editModeSubmitButton;
            recipeEditView.$editModeSubmitButton.show();
            recipeEditView.populateWithRecipe(appSession.activeCocktail);
         }

         //Prepare Create Mode
         else if (mode=="CREATE") {
            recipeEditView.setFormFeedback("Create New Recipe");
            recipeEditView.$editModeSubmitButton.hide();
            recipeEditView.$activeSubmitButton = recipeEditView.$createModeSubmitButton;
            recipeEditView.$createModeSubmitButton.show();
         }

         //Invalid Mode
         else {
            recipeEditView.mode = null;
            console.trace();
            throw Error(`What? Invalid mode '${mode}' attempted.`);
         }

         resolve();
      });
   },
   show: async function(mode, showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await recipeEditView.beforeShow(mode);
      ui.showView(recipeEditView, showAnimation);
   },
   reset: function() {
      recipeEditView.mode = null;
      recipeEditView.editModeTargetId = null;
      recipeEditView.resetForm();
   },

   setFormFeedback: function(feedback, isError=false) {
      recipeEditView.$formFeedback.text(feedback);
      (isError) ?
         recipeEditView.$formFeedback.css("color", "#FF8A80")
         : recipeEditView.$formFeedback.css("color", "");
   },
   populateWithRecipe: function(recipe) {
      //TODO: populateWithRecipe()
      console.log(`> Populating recipeEditView with:`, recipe);
   },
   buildIngredientBlock: function(blockIndex) {
      return `
         <div id="recipeEdit-ingredientBlock-${blockIndex}" class="recipeEdit-ingredientBlock" style="display:none;">
            <div class="wrapper-ingredientBlock-svg-remove">
               <img src="resources/icons/close.svg" class="svg-ingredientBlock-remove" alt="Remove ingredient.">
            </div>

            <div class="wrapper-input wrapper-ingredientBlock-name">
               <input id="js-input-recipeEdit-ingredientBlock-${blockIndex}-name" class="js-input-ingredientBlock-name" type="text" title="Ingredient name." aria-label="ingredient name" required>
               <label id="js-label-recipeEdit-ingredientBlock-${blockIndex}-name" class="typo-body-small typo-color-orange">Ingredient Name</label>
            </div>

            <div class="wrapper-input wrapper-ingredientBlock-amount">
               <input id="js-input-recipeEdit-ingredientBlock-${blockIndex}-amount" class="js-input-ingredientBlock-amount" type="number" min="0" step="any" title="Ingredient amount." aria-label="ingredient amount" required>
               <label id="js-label-recipeEdit-ingredientBlock-${blockIndex}-amount" class="typo-body-small typo-color-orange">Ingredient Amount</label>
            </div>

            <div class="wrapper-input wrapper-ingredientBlock-measurementUnit">
               <input id="js-input-recipeEdit-ingredientBlock-${blockIndex}-measurementUnit" class="js-input-ingredientBlock-measurementUnit" type="text" title="Ingredient measurement unit." aria-label="ingredient measurement unit" required>
               <label id="js-label-recipeEdit-ingredientBlock-${blockIndex}-measurementUnit" class="typo-body-small typo-color-orange">Measurement Unit</label>
            </div>
         </div>
      `;
   },
   addIngredientBlock: function() {
      const slideDownAnimationDuration = 400; //ms

      let newBlockIndex = 0;
      //Depending on how the user has added and deleted blocks, an ingredientBlock with that index may already exist
      //Existence is determined by checking if the ingredientBlock has a 'length' property
      while( $(`#recipeEdit-ingredientBlock-${newBlockIndex}`).length ) {
         newBlockIndex++;
      }

      //Create and add the new ingredientBlock
      const createdIngredientBlock = recipeEditView.buildIngredientBlock(newBlockIndex);
      recipeEditView.$ingredientBlocksWrapper.append(createdIngredientBlock);

      //Create a validity flag index for the new ingredientBlock
      recipeEditView.ingredientBlockValidityFlags[newBlockIndex] = {
         nameIsValid: false,
         amountIsValid: false,
         measurementUnitIsValid: false
      };

      recipeEditView.validateForm();

      //Slide the new ingredientBlock down, and run the specified callback
      $(`#recipeEdit-ingredientBlock-${newBlockIndex}`).slideDown(slideDownAnimationDuration, function() {
         const $button = recipeEditView.$addIngredientBlockButton;
         const viewPaddingTop = Number( $button.closest(".view").css("padding-top").replace("px", ""));

         //Ensure the view is scrolled such that the new ingredientBlock is made immediately available
         $("html, body").animate({
            scrollTop: ($button.offset().top + $button.height() + viewPaddingTop - $(window).height())
         }, 400);
         //Formula: $button distance from the top of the page, plus its own height, plus the padding top of the view, minus the current height of the window.
      });
   },

   enableActiveSubmitButton: function() {
      recipeEditView.$activeSubmitButton.prop("disabled", false);
   },
   disableActiveSubmitButton: function() {
      recipeEditView.$activeSubmitButton.prop("disabled", true);
   },

   validateCocktailNameField: function() {
      const cocktailName = recipeEditView.$cocktailNameInput.val();
      const initialState = recipeEditView.cocktailNameInputIsValid;

      if(!cocktailName) {
         recipeEditView.$cocktailNameLabel.addClass("invalid");
         recipeEditView.$cocktailNameLabel.text("Cocktail Name is blank.");
         recipeEditView.cocktailNameInputIsValid = false;
      }
      else if(cocktailName.trim().length != cocktailName.length) {
         recipeEditView.$cocktailNameLabel.addClass("invalid");
         recipeEditView.$cocktailNameLabel.text("Cocktail Name begins/ends in whitespace.");
         recipeEditView.cocktailNameInputIsValid = false;
      }
      else {
         recipeEditView.$cocktailNameLabel.removeClass("invalid");
         recipeEditView.$cocktailNameLabel.text(recipeEditView.initialCocktailNameLabel);
         recipeEditView.cocktailNameInputIsValid = true;
      }

      //If the validity of the field has changed
      if (initialState != recipeEditView.cocktailNameInputIsValid) {
         recipeEditView.validateForm();
      }
   },
   validateIngredientNameField: function(fieldId) {
      const field = $("#"+fieldId);
      const label = $("#"+field.siblings("label")[0].id);

      const ingredientName = field.val();
      //Get the 'id' of the containing ingredientBlock, and pull the index number out of it
      const index = field.closest(".recipeEdit-ingredientBlock").attr("id").replace("recipeEdit-ingredientBlock-", "");
      const initialState = recipeEditView.ingredientBlockValidityFlags[index].nameIsValid;

      //Blank
      if(!ingredientName) {
         label.addClass("invalid");
         label.text("Ingredient Name is blank.");
         recipeEditView.ingredientBlockValidityFlags[index].nameIsValid = false;
      }
      //Whitespace
      else if(ingredientName.trim().length != ingredientName.length) {
         label.addClass("invalid");
         label.text("Ingredient Name begins/ends in whitespace.");
         recipeEditView.ingredientBlockValidityFlags[index].nameIsValid = false;
      }
      //Valid
      else {
         label.removeClass("invalid");
         label.text(recipeEditView.initialIngredientNameLabel);
         recipeEditView.ingredientBlockValidityFlags[index].nameIsValid = true;
      }

      //If the validity of the field has changed
      if (initialState != recipeEditView.ingredientBlockValidityFlags[index].nameIsValid) {
         recipeEditView.validateForm();
      }
   },
   validateIngredientAmountField: function(fieldId) {
      const field = $("#"+fieldId);
      const label = $("#"+field.siblings("label")[0].id);

      const ingredientAmount = field.val();
      //Get the 'id' of the containing ingredientBlock, and pull the index number out of it
      const index = field.closest(".recipeEdit-ingredientBlock").attr("id").replace("recipeEdit-ingredientBlock-", "");
      const initialState = recipeEditView.ingredientBlockValidityFlags[index].amountIsValid;

      //Whitespace
      if(ingredientAmount.trim().length != ingredientAmount.length) {
         label.addClass("invalid");
         label.text("Cocktail Amount begins/ends in whitespace.");
         recipeEditView.ingredientBlockValidityFlags[index].amountIsValid = false;
      }
      //Value
      else if(ingredientAmount <= 0) {
         label.addClass("invalid");
         label.text("Cocktail Amount is less than or equal to 0.");
         recipeEditView.ingredientBlockValidityFlags[index].amountIsValid = false;
      }
      //Erroneous Entry
      else if(!field[0].validity.valid || Number(ingredientAmount)==="NaN") {
         label.addClass("invalid");
         label.text("Cocktail Amount is invalid.");
         recipeEditView.ingredientBlockValidityFlags[index].amountIsValid = false;
      }
      //Blank
      else if(!ingredientAmount) {
         label.addClass("invalid");
         label.text("Cocktail Amount is blank.");
         recipeEditView.ingredientBlockValidityFlags[index].amountIsValid = false;
      }
      //Valid
      else {
         label.removeClass("invalid");
         label.text(recipeEditView.initialIngredientAmountLabel);
         recipeEditView.ingredientBlockValidityFlags[index].amountIsValid = true;
      }

      //If the validity of the field has changed
      if (initialState != recipeEditView.ingredientBlockValidityFlags[index].amountIsValid) {
         recipeEditView.validateForm();
      }
   },
   validateIngredientMeasurementUnitField: function(fieldId) {
      const field = $("#"+fieldId);
      const label = $("#"+field.siblings("label")[0].id);

      const measurementUnit = field.val();
      //Get the 'id' of the containing ingredientBlock, and pull the index number out of it
      const index = field.closest(".recipeEdit-ingredientBlock").attr("id").replace("recipeEdit-ingredientBlock-", "");
      const initialState = recipeEditView.ingredientBlockValidityFlags[index].measurementUnitIsValid;

      //Blank
      if(!measurementUnit) {
         label.addClass("invalid");
         label.text("Measurement Unit is blank.");
         recipeEditView.ingredientBlockValidityFlags[index].measurementUnitIsValid = false;
      }
      //Whitespace
      else if(measurementUnit.trim().length != measurementUnit.length) {
         label.addClass("invalid");
         label.text("Measurement Unit begins/ends in whitespace.");
         recipeEditView.ingredientBlockValidityFlags[index].measurementUnitIsValid = false;
      }
      //Valid
      else {
         label.removeClass("invalid");
         label.text(recipeEditView.initialIngredientMeasurementUnitLabel);
         recipeEditView.ingredientBlockValidityFlags[index].measurementUnitIsValid = true;
      }

      //If the validity of the field has changed
      if (initialState != recipeEditView.ingredientBlockValidityFlags[index].measurementUnitIsValid) {
         recipeEditView.validateForm();
      }
   },
   validateForm: function() {
      const flagsArray = recipeEditView.ingredientBlockValidityFlags;
      let ingredientsAreValid = false;
      let formIsValid = false;

      //No ingredientBlock's
      if(!flagsArray.length) {
         console.warn("validateForm() flagsArray is empty.");
         formIsValid = false;
      }

      //No non-null values
      else if(flagsArray.length==1 && flagsArray[0]==null) {
         console.warn("validateForm() flagsArray only contains one 'null' value.");
         formIsValid = false;
      }

      //Otherwise, test the flagsArray for validity
      else {
         ingredientsAreValid = flagsArray.every((currentFlag)=> {
            if(currentFlag===null) {
               //If the current flag is the remnant of a now-deleted ingredientBlock, it is also valid. This is tested for here, because the second test in the return statement below will throw an error when looking for validity properties on 'null'.
               return true;
            }
            return(
               currentFlag.nameIsValid===true
               && currentFlag.amountIsValid===true
               && currentFlag.measurementUnitIsValid===true
            );
         })
      }

      (recipeEditView.cocktailNameInputIsValid && ingredientsAreValid) ?
         recipeEditView.enableActiveSubmitButton()
         : recipeEditView.disableActiveSubmitButton();
   },
   getDataFromForm: function() {
      const name = recipeEditView.$cocktailNameInput.val();
      const ingredients = [];
      const directions = recipeEditView.$directionsInput.val();

      //Collect recipe ingredients
      $(".recipeEdit-ingredientBlock").each(function(index, element) {
         const $currentBlock = $(element);
         let composedIngredientBlock = {
            name: $currentBlock.find(".js-input-ingredientBlock-name").val(),
            amount: Number($currentBlock.find(".js-input-ingredientBlock-amount").val()),
            measurementUnit: $currentBlock.find(".js-input-ingredientBlock-measurementUnit").val()
         };
         ingredients.push( composedIngredientBlock );
      });

      const returnObject = {
         name: name,
         ingredients: ingredients
      };
      if(directions) {returnObject.directions = directions}

      return returnObject;
   },

   resetCocktailNameField: function() {
      recipeEditView.$cocktailNameInput.val("");
      recipeEditView.$cocktailNameLabel.text(recipeEditView.initialCocktailNameLabel);
      recipeEditView.$cocktailNameLabel.removeClass("invalid");
      recipeEditView.cocktailNameInputIsValid = false;
      //It is possible that this method is called before $activeSubmitButton has been set
      if(recipeEditView.$activeSubmitButton) {recipeEditView.disableActiveSubmitButton();}

   },
   resetIngredientBlocks: function() {
      recipeEditView.$ingredientBlocksWrapper.html(recipeEditView.initialIngredientBlocksWrapper);
      recipeEditView.ingredientBlockInputsAreValid = false;
      //It is possible that this method is called before $activeSubmitButton has been set
      if(recipeEditView.$activeSubmitButton) {recipeEditView.disableActiveSubmitButton();}
   },
   resetForm: function() {
      recipeEditView.setFormFeedback(recipeEditView.initialFormFeedback);
      recipeEditView.$ingredientBlocksWrapper.html(recipeEditView.initialIngredientBlocksWrapper);
      recipeEditView.resetCocktailNameField();
      recipeEditView.resetIngredientBlocks();
      recipeEditView.ingredientBlockValidityFlags = [{nameIsValid: false,amountIsValid: false,measurementUnitIsValid: false}];
      recipeEditView.$editModeSubmitButton.hide();
      recipeEditView.$createModeSubmitButton.hide();
   },

   //API
   createCocktail: function(cocktailData) {
      return new Promise((resolve, reject)=> {
         console.log("createCocktail() cocktailData:", cocktailData);

         $.ajax({
            method: "POST",
            url: "/api/cocktail/create",
            contentType: "application/json",
            data: JSON.stringify(cocktailData)
         })
         .then(async ()=> {
            await ui.hideCurrentView("fadeOutRight");
            userHomeView.show("fadeInLeft");
            resolve();
         })
         .catch((returnedData)=> {
            const response = returnedData.responseJSON;
            const errorType = response.errorType;
            console.error("ERROR:", response);

            switch(errorType) {
               case "NoActiveSession":
                  alert("ERROR: MissingField");
                  break;
               case "ExpiredJWT":
                  alert("ERROR: IncorrectDataType");
                  break;
               case "MalformedJWT":
                  alert("ERROR: UnexpectedDataType");
                  break;
               case "MissingField":
                  alert("ERROR: MissingField");
                  break;
               case "IncorrectDataType":
                  alert("ERROR: IncorrectDataType");
                  break;
               case "InvalidFieldSize":
                  alert("ERROR: UnexpectedDataType");
                  break;
               default:
                  alert("ERROR: createCocktail() enountered an unexpected error.");
                  break;
            }
         });
      });
   },
   updateCocktail: function(targetId, updateData) {
      //TODO: updateCocktail(targetId, updateData)
   }
};