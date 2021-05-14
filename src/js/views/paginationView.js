import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination')
    
  
    _generateMarkup() {

      const curPage = this._data.page;
      const numPages = Math.ceil( this._data.results.length / this._data.resultsPerPage );
      
      // buttons markup
      const btnNext = `
      <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
      const btnPrev = `
      <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
      `;
      // CASES
      // Page 1, and there are other pages
      if (curPage === 1 && numPages > 1) return btnNext;
  
      // Last page
      if (curPage === numPages && numPages > 1) return btnPrev;
          

      // Other page(in between)
      if (curPage < numPages) return btnPrev + btnNext;    
    
      
      // Page 1, and there are NO other pages
      return ''

    };

    addHandlerClick(handler){
      this._parentElement.addEventListener('click', function(e){
        const btn = e.target.closest('.btn--inline');
        if (!btn) return;
        const goToPage = +btn.dataset.goto;
        handler(goToPage);

      });
    };
  
  };
  
  export default new PaginationView();