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
    this.dataSet = {};
    this.dataSet.data = data;

    console.log('Data fetched', this.dataSet.data);

    // get array of all tags
    let tags = data.map(function(product) {
      return product.tags;
    });

    // flatten the inner arrays
    let flatTags = [].concat.apply([], tags);

    // remove duplicates and sort
    this.dataSet.tags = [...(new Set(flatTags))].sort();

    return this.dataSet;
  }

  getElements(dataSet) {
    this.dataSet = dataSet;
    this.dataSet.tagListEl = this.config.element.querySelector('.tag-list');

    return this.dataSet;
  }

  bindEventListeners(dataSet) {
    this.dataSet = dataSet;
    let tags = this.dataSet.tags;
    let clear = this.config.element.querySelector('.clear-button');
    clear.addEventListener('click', this.clearAll.bind(this));

    this.dataSet.tagListMarkup = tags.map((item) => `
      <li>
        <span data-tag="${item}" class="tag is-link">
          ${item}
        </span>
      </li>
    `).join(" ");
    this.dataSet.tagListEl.addEventListener('click', this.tagListClicked.bind(this));



    return this.dataSet;
  }

  render(dataSet) {
    this.dataSet = dataSet;
    this.dataSet.tagListEl.innerHTML = this.dataSet.tagListMarkup;

  }

  tagListClicked(event) {

    // grabbing tags from data attribute
    let dataTag = event.path[0].getAttribute('data-tag');

    // clear out selected film on click
    this.dataSet.selectedFilms = [];
    this.dataSet.filmTitleEl = this.config.element.querySelector('.matching-items-list');
    this.dataSet.filmTitleEl.innerHTML = '';

    // setting active tag
    let tagList = this.config.element.querySelectorAll('.tag.is-link');
    tagList.forEach(function(tag){
      if(tag.classList.contains('active')){
        tag.classList.remove('active');
      }
    });

    // show selected films if they matches tag
    if(dataTag){

      // make sure it's not catching parents of the clicked link
      if(event.path[0].classList.contains('is-link')){
        event.path[0].classList.add('active');
      }

      // filter out relevant films
      this.dataSet.selectedFilms = this.dataSet.data.filter(function(film) {
        return film.tags.includes(dataTag);
      });

      // build markup
      let selectedFilmsMarkup = this.dataSet.selectedFilms.map((film) => `
        <li data-id="${film.id}" class="is-link">
          ${film.title}
        </li>
      `).join(" ");

      let tagTitle = this.config.element.querySelector('.tag-title');
      tagTitle.innerHTML = dataTag;

      // populate films
      this.dataSet.filmTitleEl.innerHTML = selectedFilmsMarkup;

      // clear selected film on click
      this.dataSet.selectedFilm = '';

      // bind film clicks
      this.dataSet.filmTitleEl.addEventListener('click', this.filmListClicked.bind(this));
    }
  }

  clearAll() {
      // clear out selected film and tags
      let tagTitle = this.config.element.querySelector('.tag-title');
      let filmTitle = this.config.element.querySelector('.selected-item');
      this.dataSet.selectedFilms = [];
      this.dataSet.filmTitleEl = this.config.element.querySelector('.matching-items-list');
      this.dataSet.filmTitleEl.innerHTML = '';
      filmTitle.querySelector('.thumbnail').src = 'http://via.placeholder.com/350x350';
      filmTitle.querySelector('.subtitle').innerHTML = 'No Series Selected';
      filmTitle.querySelector('p').innerHTML = '';
      filmTitle.querySelector('.rating').innerHTML = '';
      filmTitle.querySelector('.language').innerHTML = '';
      filmTitle.querySelector('.country').innerHTML = '';
      filmTitle.querySelector('.type').innerHTML = '';
      filmTitle.querySelector('.episodes').innerHTML = '';
      tagTitle.innerHTML = 'No Tag Selected';
      let tagList = this.config.element.querySelectorAll('.tag.is-link');
      tagList.forEach(function(tag){
        if(tag.classList.contains('active')){
          tag.classList.remove('active');
        }
      });
  }

  filmListClicked(event) {
    // set selected film to id
    let filmId = event.path[0].getAttribute('data-id');
    let filmList = this.config.element.querySelector('.matching-items-list').querySelectorAll('li');
    filmList.forEach(function(film){
      if(film.classList.contains('active')){
        film.classList.remove('active');
      }
    });

    // make sure it's not catching parents of the clicked link
    if(event.path[0].classList.contains('is-link')){
      event.path[0].classList.add('active');
    }

    // assign film data in dataSet
    this.dataSet.selectedFilm = this.dataSet.data.filter(function(film) {
      return film.id.toString() === filmId;
    });

    // populate html for film
    let filmTitle = this.config.element.querySelector('.selected-item');
    filmTitle.querySelector('.thumbnail').src = this.dataSet.selectedFilm[0].thumbnail;
    filmTitle.querySelector('.subtitle').innerHTML = this.dataSet.selectedFilm[0].title;
    filmTitle.querySelector('p').innerHTML = this.dataSet.selectedFilm[0].description;
    filmTitle.querySelector('.rating').innerHTML = this.dataSet.selectedFilm[0].rating;
    filmTitle.querySelector('.language').innerHTML = this.dataSet.selectedFilm[0].nativeLanguageTitle;
    filmTitle.querySelector('.country').innerHTML = this.dataSet.selectedFilm[0].sourceCountry;
    filmTitle.querySelector('.type').innerHTML = this.dataSet.selectedFilm[0].type;
    filmTitle.querySelector('.episodes').innerHTML = this.dataSet.selectedFilm[0].episodes;
  }

}
