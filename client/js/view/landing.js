const landingView = {
   //#region Element jQuery Selectors
   $view: $("#js-view-landing"),
   $headerButtons: {
      $signIn: $("#js-headerButton-signIn")
   },
   $registerButton: $("#js-landing-button-register"),
   //#endregion

   configureEventListeners: function() {
      landingView.$headerButtons.$signIn.on("click", async function(e) {
         await ui.hideCurrentView("fadeOutLeft");
         signInView.show("fadeInRight");
      });

      landingView.$registerButton.on("click", async function(e) {
         await ui.hideCurrentView("fadeOutLeft");
         registerView.show("fadeInRight");
      });
   },
   beforeShow: function() {
      return new Promise((resolve, reject)=> {
         //No functionality required yet
         resolve();
      });
   },
   show: async function(showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await landingView.beforeShow();
      ui.showView(landingView, showAnimation);
   },
};