# [Sip](https://pacific-castle-68250.herokuapp.com/) lets you efficiently manage your favorite cocktail recipes.
It also lets you:
- Save the cocktail recipe you told your friend you would try sometime.
- Pull up that cocktail recipe when you're finally in the mood for something experimental.
- Edit that recipe when you learn your friend is not great at making cocktails.
- Delete that recipe it when you decide that you're better off starting from scratch.

## Tools
HTML & CSS, JavaScript, jQuery, Mongoose & MongoDB, Express, Node, Mocha & Chai, Git, and NPM.

## Author
Designed & Developed by Marshall Spainhour

## API Outline
Note: the 🔒icon indicates that a valid 'session' cookie is required to access the associated endpoint.

### User Authorization
- POST /api/auth/sign-in
   - Request: 'username', 'password'
   - Response: 'session' and 'user' cookies are set
- GET /api/auth/sign-out
   - Response: 'session' and 'user' cookies are cleared

### Cocktails
- POST /api/cocktail/create 🔒
   - Request: 'name', 'ingredients', optionally 'directions'
   - Response: new cocktail recipe
- PUT /api/cocktail/update 🔒
   - Request: 'targetId', at least one of ('newName', 'newIngredients,' 'newDirections')
   - Response: updated cocktail recipe
- DELETE /api/cocktail/delete 🔒
   - Request: 'targetId'
   - Response: the cocktail recipe that was deleted
- GET /api/cocktail/:targetId
   - Response: requested cocktail recipe

<!-- ### Users
- POST /api/user/create
   - Request:
   - Response:
- GET /api/user/:username
   - Response: -->

   ## Remainder In progress...

## Screenshots
<p align="center">
   <img src="readme resources/landing.png">
</p>
<p align="center">
   <img src="readme resources/signIn.png">
</p>
<p align="center">
   <img src="readme resources/userHome.png">
</p>
<p align="center">
   <img src="readme resources/recipeEdit.png">
</p>