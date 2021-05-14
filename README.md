# ForkifyApp
App for searching and finding great cooking recipes.

This app was created for learning purposes, and this project explored the following segments and more:

-MCV architecture

-Working with ES6 modules

-Async/await, promises, AJAX and API calls

-Publisher-subscriber patterns

-Writing easy to undestand clean and organised code

-Pagination of content

-Bookmarking and storage of data locally

-Uploading of data to API

-Working with forms

-Data validation

-keeping state of the app

-Converting data formats and data structures

-Catching and handling errors based on their sources

-DOM events and interactions

## Known issues

-The app automatically calculates the total calorie value of any given recipe based on its ingredients. 
For this task spoonacular API was used. Free monthly plan includes only 150 API calls per 24h so this limit can be reached quite quickly if the recipes have many ingredients.

-The accuracy of the calorie calculation is severly limited by the Forkify API due to the description of ingredients in its database. Descriptions are too unorganised or vague to be used as queries
for the API calls. The only solution would be to switch to a different API with more clearly defined recipe ingredients, however this solution was not applied in this app because it would 
break some of its features such as uploading a recipe.
