module.exports = {
   "extends": "eslint:recommended", //ESLint's recommended linting settings
   "rules": {
      // "ruleName": "off"/"warn"/"error"
   },

   "env": {
      "browser": true, //Browser global variables
      "node": true, //Node.js global variables and Node.js scoping
      "shared-node-browser": true, //Globals common to both Node.js and Browser
      "amd": true, //defines 'require()' and 'define()' as global variables as per the AMD spec
      "es6": true, //Enables all ECMAScript 6 features except for modules (automatically sets the 'ecmaVersion' parser option to '6')
      "mocha": true, //Adds all of the Mocha testing global variables
      "jquery": true, //jQuery global variables
      "mongo": true //MongoDB global variables
   },
   "parserOptions": {
      "ecmaVersion": 2017
   }
};