import * as model from './model.js';
import {MODAL_CLOSE_SEC, RENDER_FORM_AFTER_SEC} from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// from parcel - keeps state
// if(module.hot) {
//   module.hot.accept();
// }

async function controlRecipes(){
  try {
    const id = window.location.hash.slice(1);
    if(!id) return;
    recipeView.renderSpinner();

    // 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    
    // 1. loading recipe
    await model.loadRecipe(id);
    // 2. rendering recipe
    recipeView.render(model.state.recipe);
    // 3. get calories information
    await model.getCalories();
    // 4. update recipeView with new calorie info
    recipeView.update(model.state.recipe);
   

  }catch(err){
    console.log(err);
    recipeView.renderError();
  };
};

async function controlSearchResults(){
  try{
    // 1) get search query
    const query = searchView.getQuery();
    if(!query) return;
    resultsView.renderSpinner();
    // 2) load results
    await model.loadSearchResults(query)
    // 3) render results
    resultsView.render(model.getSearchResultsPage());
    // 4) render inital pagination buttons
    paginationView.render(model.state.search);
  }catch(err){
    console.log(err);
  };
};

function controlPagination(goToPage) {
  
  // 1) render results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 2) render pagination buttons
  paginationView.render(model.state.search);
  
};

function controlServings(newServings) {
  // Update the recipe servings and calories(in state)
  model.updateServings(newServings);
  // Update the recipe view
  recipeView.update(model.state.recipe);

};

function controlAddBookmark() {

  // add or remove bookmark in the state
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // update recipeView (icon changed)
  recipeView.update(model.state.recipe);
  // render bookmarksView
  bookmarksView.render(model.state.bookmarks)

};

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
};

async function controlAddRecipe (newRecipe) {
  try{
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL (without reloading the page) using history browser API
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window after defined time (add hidden class) and render form again
    setTimeout(() => {
        // hide message window
        addRecipeView.toggleWindow('addHidden');
        // render form again after defined time
        setTimeout(() => {
          addRecipeView.render('form');
        }, RENDER_FORM_AFTER_SEC * 1000);
      
    }, MODAL_CLOSE_SEC * 1000);

  }catch(err){
    addRecipeView.renderError(err); 
  };
};




// INIT
function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
