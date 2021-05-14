import View from './View.js';
import icons from 'url:../../img/icons.svg';


class addRecipeView extends View {
    _parentElement = document.querySelector('.upload');
    _message = 'Recipe was successfully uploaded!'

    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _btnOpen = document.querySelector('.nav__btn--add-recipe');
    _btnClose = document.querySelector('.btn--close-modal');
    
    _addHandlerShowWindow() {
      this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
    };

    _addHandlerHideWindow() {
      this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
      this._overlay.addEventListener('click', this.toggleWindow.bind(this));
    };

    addHandlerUpload(handler) {
      this._parentElement.addEventListener('submit', function(e) {
        e.preventDefault();
        // Reminder: 'this' inside eventlistener callback func. points to the element that the listener is attached to (form element)
        const dataArr = [...new FormData(this)];
        const data = Object.fromEntries(dataArr);
      
        handler(data);
        
      });
    };

    toggleWindow(action = 'toggle') {
      if (action === 'addHidden') {
        this._overlay.classList.add('hidden');
        this._window.classList.add('hidden'); 
        return;
      };
      this._overlay.classList.toggle('hidden');
      this._window.classList.toggle('hidden'); 
    };

    constructor() {
        super();
        this._addHandlerShowWindow();
        this._addHandlerHideWindow();
    };

    _generateMarkup() {
      return `
      <div class="upload__column">
          <h3 class="upload__heading">Recipe data</h3>
          <label>Title</label>
          <input required name="title" type="text" placeholder="e.g. Slavonska pizza" />
          <label>URL</label>
          <input required name="sourceUrl" type="text" placeholder="e.g. https://www.mypage.com/Slavonska-pizza" />
          <label>Image URL</label>
          <input required name="image" type="text" placeholder="e.g. https://www.mypage.com/slavonska.jpg"/>
          <label>Publisher</label>
          <input required name="publisher" type="text" placeholder="Publisher name"/>
          <label>Prep time</label>
          <input required name="cookingTime" type="number" placeholder="e.g. 20" />
          <label>Servings</label>
          <input required name="servings" type="number" placeholder="e.g. 4" />
        </div>
        
        <div class="upload__column">
          <h3 class="upload__heading">Ingredients</h3>
          <label>Ingredient 1</label>
          <input
            value=""
            type="text"
            required
            name="ingredient-1"
            placeholder="Format: 'Quantity,Unit,Description'"
          />
          <label>Ingredient 2</label>
          <input
            value=""
            type="text"
            name="ingredient-2"
            placeholder="Format: 'Quantity,Unit,Description'"
          />
          <label>Ingredient 3</label>
          <input
            value=""
            type="text"
            name="ingredient-3"
            placeholder="Format: 'Quantity,Unit,Description'"
          />
          <label>Ingredient 4</label>
          <input
            type="text"
            name="ingredient-4"
            placeholder="Format: 'Quantity,Unit,Description'"
          />
          <label>Ingredient 5</label>
          <input
            type="text"
            name="ingredient-5"
            placeholder="Format: 'Quantity,Unit,Description'"
          />
          <label>Ingredient 6</label>
          <input
            type="text"
            name="ingredient-6"
            placeholder="Format: 'Quantity,Unit,Description'"
          />
        </div>

        <button class="btn upload__btn">
          <svg>
            <use href="${icons}#icon-upload-cloud"></use>
          </svg>
          <span>Upload</span>
        </button>
      `;
    }
    
    
  
  };
  
  export default new addRecipeView();