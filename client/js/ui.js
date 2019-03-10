"use strict";

const ui = {
   //#region UI State Variables
   currentView: null,
   //#endregion



   //#region UI Setup Functions
   setup: function() {
      ui.configureEventListeners();
   },

   configureEventListeners: function() {
      //If the user is navigating with the mouse, hide unecessary accessibility styles
      $(window).on("mousedown", function(e) {
         if($("html").hasClass("user-navigating-with-keyboard")) {
            console.log("Mouse navigation detected.");
            $("html").removeClass("user-navigating-with-keyboard");
         }
      });

      //If the user is navigating with the keyboard (specifically the tab key) and acessibility styles have been hidden, show necessary accessibility styles
      $(window).on("keydown", function handleTab(e) {
         if(e.key==="Tab" && !$("html").hasClass("user-navigating-with-keyboard")) {
            console.log("Keyboard navigation detected.");
            $("html").addClass("user-navigating-with-keyboard");
         }
      });

      landingView.configureEventListeners();
      signInView.configureEventListeners();
      registerView.configureEventListeners();
      userHomeView.configureEventListeners();
      recipeEditView.configureEventListeners();
      recipeView.configureEventListeners();
   },
   //#endregion



   //#region General UI Functions
   scrollToBottom: function($targetElement, ms) {
      console.log("$targetElement:", $targetElement);
      console.log("ms:", ms);

      $("html").stop(true)
      .animate({
         scrollTop: $targetElement.offset().top
      }, ms);
   },
   reset: function() {
      signInView.reset();
      registerView.reset();
      userHomeView.reset();
      recipeEditView.reset();
      recipeView.reset();
   },
   //#endregion



   //#region Animation Functions
   validateHideAnimation: function(hideAnimation) {
      const validHideAnimations = ["fadeOutLeft", "fadeOut", "fadeOutRight"];
      if(!validHideAnimations.includes(hideAnimation)) {
         throw Error(`Invalid showAnimation: '${hideAnimation}'`);
      }
   },
   validateShowAnimation: function(showAnimation) {
      const validShowAnimations = ["fadeInLeft", "fadeIn", "fadeInRight"];
      if(!validShowAnimations.includes(showAnimation)) {
         throw Error(`Invalid showAnimation: '${showAnimation}'`);
      }
   },

   hideCurrentView: function(hideAnimation="fadeOut") {
      const headerButtonHideDelay = 100; //ms
      const headerButtonFadeOutDuration = 300; //ms

      return new Promise(async (resolve)=> {
         ui.validateHideAnimation(hideAnimation);

         //Hide all header buttons.
         //The wildcard selector is used in case additional, non-button elements are added to the header in the future.
         $("#wrapper-header-rightArea button")
         .css({
            "pointer-events": "none",
            "transition": "none"
         })
         .delay(headerButtonHideDelay)
         .fadeOut(headerButtonFadeOutDuration)
         .css({
            "pointer-events": "",
            "transition": ""
         });

         //If there's an active view, hide it
         if (ui.currentView) {
            await ui.hideWithAnimation(ui.currentView.$view, hideAnimation);
            ui.currentView = null;
         }
         else {
            console.error(`ui.hideCurrentView() called while ui.currentView is null with animation '${showAnimation}'.`);
            console.trace();
         }
         resolve();
      });
   },
   showView: function(targetView, showAnimation) {
      const headerButtonFadeInDuration = 300; //ms

      ui.validateShowAnimation(showAnimation);

      //Prevent the new view's header buttons from being interactive before they have finished fading in
      for (let $currentButton of Object.values(targetView.$headerButtons)) {
         $currentButton.css({
            "pointer-events": "none",
            "transition": "none"
         });
      }

      //Show the new view
      ui.showWithAnimation(targetView.$view, showAnimation);

      //Set the currentView UI variable to the new view
      if (ui.currentView == null) {
         ui.currentView = targetView;
      }
      else {
         console.error(`ui.showView() called on already-shown view '${$targetView.$view}' with animation '${showAnimation}'.`);
         console.trace();
      }

      //Show the new view's header buttons
      for (let $currentButton of Object.values(targetView.$headerButtons)) {
         $currentButton.fadeIn(headerButtonFadeInDuration, function() {
            //Allow the new view's header buttons to be interactive now that they have finished fading in
            $currentButton.css({
               "pointer-events": "",
               "transition": ""
            });
         });
      }
   },

   hideWithAnimation: function($targetElement, hideAnimation="fadeOut") {
      return new Promise((resolve, reject)=> {
         //If the targeted element is not already hidden...
         if ($targetElement.css("display") != "none") {
            //Some of these events may be obsolete, but I am unsure where to find a up-to-date list of relevent vendor-specific 'animationend' events. As such, I have included all that I could find, obsolescence aside.
            const animationEndEvents = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

            //Register the 'animationend' event handler
            $targetElement.one(animationEndEvents, function() {
               //Add display:none to the element once it has finished animating
               $(this).hide();
               //Remove the animate.css classes from the element now that they have completed
               $(this).removeClass(`animated faster ${hideAnimation}`);
               resolve();
            });

            //Trigger the animation, and subsequently the 'animationend' event handler, by applying the animate.css classes
            $targetElement.addClass(`animated faster ${hideAnimation}`);
         }
         else {
            //Not entirely an error, but it should not occur under normal circumstances, so it is logged as an error.
            console.error(`hideWithAnimation() called on already-hidden element '${$targetElement}' with animation '${hideAnimation}'.`);
            console.trace();
            resolve();
         }

      });
   },
   showWithAnimation: function($targetElement, showAnimation="fadeIn") {
      return new Promise((resolve, reject)=> {
         //If the targeted element is hidden...
         if ($targetElement.css("display") == "none") {
            //Some of these events may be obsolete, but I am unsure where to find a up-to-date list of relevent vendor-specific 'animationend' events. As such, I have included all that I could find, obsolescence aside.
            const animationEndEvents = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

            //Register the animationEnd event handler
            $targetElement.one(animationEndEvents, function() {
               //Remove the animate.css classes from the element now that they have completed
               $(this).removeClass(`animated faster ${showAnimation}`);
               resolve();
            });

            //Trigger the animation, and subsequently the 'animationend' event handler, by applying the animate.css classes
            $targetElement.addClass(`animated faster ${showAnimation}`);
            //Remove display:none from the element as it begins animating
            $targetElement.show();
         }
         else {
            //Not entirely an error, but it should not occur under normal circumstances, so it is logged as an error.
            console.error(`showWithAnimation() called on already-shown element '${$targetElement}' with animation '${showAnimation}'.`);
            console.trace();
            resolve();
         }

      });
   },
   //#endregion
}