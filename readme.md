<br>

# [Sip](https://pacific-castle-68250.herokuapp.com/) helps you manage cocktail recipes.
- Save the cocktail recipe you told your friend you would try sometime.
- Pull up that cocktail recipe when you're finally in the mood for something experimental.
- Edit that recipe when you learn your friend is not great at making cocktails.
- Delete that recipe it when you decide that you're better off starting from scratch.

<br>

## Tools
HTML & CSS, JavaScript, jQuery, Mongoose & MongoDB, Express, Node, Mocha & Chai, Git, and NPM.

<br>

## Credit
Designed & Developed by Marshall Spainhour

<br>

## API Structure
The 🔒icon indicates that the endpoint requires authentication.

### User Authorization
- POST /api/auth/sign-in
- GET /api/auth/sign-out

### Cocktails
- POST /api/cocktail/create 🔒
- PUT /api/cocktail/update 🔒
- DELETE /api/cocktail/delete 🔒
- GET /api/cocktail/:targetId

### Users
- POST /api/user/create
- GET /api/user/:username

<br>

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