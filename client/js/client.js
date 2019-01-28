"use strict";

//Entry Point
$(function entryPoint(){
   let clickCounter = 0;
   let $button_nice = $("#nice-button");

   $button_nice.on("click", function(event) {
      clickCounter++;
      console.log(`Click counter at: ${clickCounter}`);
      if(clickCounter > 1) {
         return $button_nice.html(`Clicked ${clickCounter} times.`);
      }
      $button_nice.html("Clicked 1 time.");
   });
});