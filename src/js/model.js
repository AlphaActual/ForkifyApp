
import { async } from 'regenerator-runtime';
import {API_URL, RES_PER_PAGE, KEY, ING_API_URL, ING_API_KEY} from './config.js';
import {AJAX} from './helpers.js';



export const state = {
    recipe: {},
    search: {
        query:'',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE
    },
    bookmarks: []

};

function createRecipeObject(data) {
  const {recipe} = data.data;
    // renaming data to our liking and storing it in state object
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key}) 
    };
  
};

export async function loadRecipe(id){
   try{
        const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
        state.recipe = createRecipeObject(data);
        // check for bookmarks
        if (state.bookmarks.some(b => b.id === id)) state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

    }catch(err){
        throw err;
    };
};
// https://forkify-api.herokuapp.com/api/v2/recipes?search=pizza
export async function loadSearchResults(query){
    try{
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // renaming data to our liking and storing it in state object
        state.search.results = data.data.recipes.map(rec=>{
            return {
            id: rec.id,
            title: rec.title,
            publisher: rec.publisher,
            image: rec.image_url,
            ...(rec.key && {key: rec.key})
            };
        });
        // update state page to page 1
        state.search.page = 1; 
    }catch(err){
        throw err;
    };
};



export function getSearchResultsPage(page = state.search.page) {
  //algorithm for getting results based on page number
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage; 
  // update state with new page number
  state.search.page = page;
  // return results
  return state.search.results.slice(start, end);

};


export function updateServings(newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * newServings / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings    
  }); 
  // update calories 
  recalculateCalories(newServings);
  // update state servings  
  state.recipe.servings = newServings;
};

function persistBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export function addBookmark(recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export function deleteBookmark(id) {
  const index = state.bookmarks.findIndex(el => el.id === id);  
  state.bookmarks.splice(index, 1);    
  
  // Mark current recipe as not bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

function loadStoredBookmarks() {
  const storage = localStorage.getItem('bookmarks');
  if(storage) state.bookmarks = JSON.parse(storage);

};
loadStoredBookmarks();

export async function uploadRecipe(newRecipe) {
  try{
    // 1) Filter ingredients from all form entries and format them
    const ingredients = Object.entries(newRecipe).filter(entry => {
      return entry[0].startsWith('ingredient') && entry[1] !== '';  
    }).map(ing => {
  
      const ingArr = ing[1].split(',').map(el => el.trim());
      // 2) check if the format is correct, if not throw error
      if(ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format');
      // 3) proceed to format ingredients
      const [quantity, unit, description] = ingArr;
      return {quantity: quantity ? +quantity : null , unit, description};  
    })
    // 4) Creating recipe object with the same format as loaded from API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients   
    };
    // 5) Send data to API (it also returns data back)
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
   
    addBookmark(state.recipe);

  }catch(err){throw err};
  
};

///////// CALORIES LOGIC //////////

// Filters out ingredients which have quantity
function filterIngr(array) {
  return array.filter(ing=> ing.quantity > 0);
};

// Get info (id) from API
async function getIngredientInfo(filteredIng) {
  try{
    const foundIngredients = await Promise.all(filteredIng.map(async function(ing) {
      const ingInfo = await AJAX(`${ING_API_URL}/search?query=${ing.description}&number=1&apiKey=${ING_API_KEY}`);
      // If ingredient is found (it has id)
      if (ingInfo?.results[0]?.id) {
        return {
          id: ingInfo.results[0].id,
          quantity: ing.quantity,
          unit: ing.unit
        };
      }else return undefined;
  
    }));
    // Remove ingredients that have not been found
    return foundIngredients.filter(ing => ing !== undefined); 
  }catch(err){
    throw err;
  };
};

// Gets calorie value from API for each ingredient ID and stores the total sum in the state recipe object
export async function getCalories() {
  try{
    
    // 1) filter out ingredients which have no quantity defined
    const filteredIng = filterIngr(state.recipe.ingredients);
    // 2) get data about found queries and make an array of calorie values
    const foundIngredients = await getIngredientInfo(filteredIng);
    const caloriesArray = await Promise.all(foundIngredients.map(async function(ingredient) {
      const ingInfo = await AJAX(`${ING_API_URL}/${ingredient.id}/information?amount=${ingredient.quantity}&unit=${ingredient.unit}&apiKey=${ING_API_KEY}`);
      return +ingInfo.nutrition.nutrients[0].amount;
    }));
    // 3) Save the sum of calories of all found ingredients in the state
    state.recipe.totalCalories = caloriesArray.reduce(function (a, b) {
      return a + b;
    }, 0);

  }catch(err){
    state.recipe.totalCalories = undefined;
    console.error(err.message);
  };
};

// Recalculate calorie value when quantitiy of servings has changed
function recalculateCalories(newServings) {
  if(!state.recipe.totalCalories) return;
  const newCalorieValue = state.recipe.totalCalories * newServings / state.recipe.servings;
  state.recipe.totalCalories = newCalorieValue;
  // newQt = oldQt * newServings / oldServings  
};