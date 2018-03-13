export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this));

    console.log('Widget Instance Created');
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.data = data;
    this.tagArray = this.compileTagArray(this.data);
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.titleList = this.config.element.querySelectorAll('.title-list')[0];
    this.seriesDisplay = this.config.element.querySelectorAll('.series-display')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.titleList.addEventListener('click', this.titleListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clear.bind(this));
  }

  tagListClicked(event) {
    // Verify clicked element has class of 'tag'
    if (event.path[0].className.split(' ').indexOf('tag') !== -1) {
      this.render(event.path[0].innerHTML);
    }
  }

  titleListClicked(event) {
    // Verify clicked element has class of 'tag'
    if (event.path[0].className.split(' ').indexOf('series') !== -1) {
      this.render(null, event.path[0].id);
    }
  }


  // Methods for mutating the Data

  compileTagArray(data) {
    let tagArray = [];
    
    data.forEach(entry => {
      entry.tags.forEach(tag => {
        if (tagArray.indexOf(tag) === -1) {
          tagArray.push(tag);
        }
      });
    });
    
    return tagArray.sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  getTitlesWithTag(tag) {
    let titles = [];
    this.data.forEach(entry => {
      if (entry.tags.indexOf(tag) !== -1) {
        titles.push(entry);
      }
    });
    return titles;
  }

  getSeriesByID(id) {
    return this.data.filter(series => series.id.toString() === id)[0];
  }




  // Render Methods for rendering each section, called by main render method

  renderTags(activeTag) {
    let elements = [];
    this.tagArray.forEach(tag => {
      let isActive = (activeTag === tag) ? 'active' : '';
      elements.push(`<li><a href="#" class="tag is-link ${isActive}">${tag}</a></li>`);
    });
    return elements.join('');
  }

  renderTitles(tag, selectedSeriesID) {
    tag = tag || this.titleList.querySelectorAll('h3.subtitle')[0].innerHTML;
    let titleHeading = `<h3 class="subtitle">${tag}</h3>`,  
        titleArray = this.getTitlesWithTag(tag);
    
    let titleElements = titleArray.map(series => {
      let isActive = (series.id.toString() === selectedSeriesID) ? 'active' : '';
      return `<li><a href="#" class="series ${isActive}" id="${series.id}">${series.title}</a></li>`;
    }).join('');

    this.clearButton.disabled = false;

    return `${titleHeading}
            <ul class="matching-items-list">
              ${titleElements}
            </ul>`;
  }

  renderSeries(selectedSeriesID) {
    let series = this.getSeriesByID(selectedSeriesID);
    let seriesHeading = `<h3 class="subtitle">${series.title}</h3>`,
        seriesImage = series.thumbnail ? `<img src="${series.thumbnail}" />` : '',
        seriesDescription = series.description ? `<p>${series.description}"</p>` : '';

    // Here i ran into the question of componentising templates as much as possible, 
    // vs not wanting to put all of these template partials into memory
    return `<div class="content">
              ${seriesHeading}
              ${seriesImage}
              ${seriesDescription}
            </div>
            <ul>
              <li><strong>Rating:</strong> <span>${series.rating}</span></li>
              <li><strong>Native Language Title:</strong> <span>${series.nativeLanguageTitle}</span></li>
              <li><strong>Source Country:</strong> <span>${series.sourceCountry}</span></li>
              <li><strong>Type:</strong> <span>${series.type}</span></li>
              <li><strong>Episodes:</strong> <span>${series.episodes}</span></li>
            </ul>`
  }



  // Main render method decides which sections need to be updated based on params sent.

  render(selectedTag, selectedSeriesID) {
    // When a tag has been selected
    if (selectedTag) {
      this.tagList.innerHTML = this.renderTags(selectedTag);
      this.titleList.innerHTML = this.renderTitles(selectedTag);
    
    // When a series has been selected
    } else if (selectedSeriesID) {
      this.titleList.innerHTML = this.renderTitles(null, selectedSeriesID);
      this.seriesDisplay.innerHTML = this.renderSeries(selectedSeriesID);

    // When render is called without any params (init)
    } else {
      this.tagList.innerHTML = this.renderTags();
    }
  }

  clear() {
    this.render();
    this.titleList.innerHTML = `<div class="empty-state"><p>No Tag Selected</p></div>`;
    this.seriesDisplay.innerHTML = `<div class="empty-state"><p>No Series Selected</p></div>`;
    this.clearButton.disabled = true;
  }
}

// TODOS: - create STATE variable inside class, base render method 
//          off of changes to state instead of existence of params,
//        - Style series column
//        - Add Error handling for data loading
//        - Deep linking since we're using Anchor tags?