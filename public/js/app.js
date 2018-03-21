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
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.js-tag-list')[0];

    //find and store other elements you need
    this.titleList = this.config.element.querySelectorAll('.js-matching-items-list')[0];
    this.clearButton = this.config.element.querySelectorAll('.js-clear-button')[0];
    
    // TODO: add matching item list and the other list here
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
    this.titleList.addEventListener('click', this.titleListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearSelectedTitle.bind(this));
  }
  
  render(data) {
      const $tagsList = $('.tag-list'),

        // create array with only the tags
        tagsArr = this.data.reduce((acc, currVal) => acc.concat(currVal.tags), [])

        // remove duplicate tags
        .filter((elem, pos, arr) => arr.indexOf(elem) == pos)
        
        // sort tags alphabetically (including upper case)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

        // write tags to the DOM
        .forEach(tag => $tagsList
          .append(`<li><span class="tag is-link">${tag}</span></li>`)
        );
  }

  tagListClicked(event) {
    console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    
    const $target = $(event.target),

      // get series/movies that match the selected tag
      selectedTitles = this.data.filter( title => title.tags.includes($target.text()));
    
    // if this isn't a link or is already active, simply return
    if(!$target.hasClass('is-link') || $target.hasClass('active')) {
      return;
    }

    // remove active class from previous selected tag and set it on new tag
    $('.is-link.active').removeClass('active');
    $target.addClass('active');

    // enable clear button
    this.clearButton.removeAttribute('disabled');

    // set the title of the selected tag section
    $('.tag-title').text(`"${$target.text()}"`);
    
    // render list of movies
    this.renderSelectedTitles(selectedTitles);
  }

  renderSelectedTitles(selectedTitles) {
    const $matchingItemList = $('.matching-items-list');

    // remove previous rendered titles
    $('.matching-items-list li').remove();

    // add list of titles to the DOM
    selectedTitles
      .forEach( film => $matchingItemList
        .append(`<li class="film-title" data-id=${film.id}>${film.title}</li>`)
      );
  }

  titleListClicked(event) {
    const $target = $(event.target),
      id = $target.attr('data-id'),

      // get the selected title by it's ID
      selectedTitle = this.data.filter( title => title.id == id);

      // if this is not a li or is already active, simply return
      if(!$target.hasClass('film-title') || $target.hasClass('active')) {
        return;
      }

      // remove active class from previous selected title and add it to the new one
      $('.film-title.active').removeClass('active')
      $target.addClass('active');

      // render 
      this.renderSelectedTitle(selectedTitle[0]);
  }

  renderSelectedTitle(movie) {
    let img = movie.thumbnail,
      description = movie.description,
      rating = movie.rating,
      nativeLang = movie.nativeLanguageTitle,
      country = movie.sourceCountry,
      type = movie.type,
      title = movie.title, 
      episodes = movie.episodes;

    $('.film-img').attr('src', img);
    $('.film-description').text(description);
    $('.film-rating').text(rating);
    $('.film-native-title').text(nativeLang);
    $('.film-country').text(country);
    $('.film-subtitle').text(title);
    $('.film-type').text(type);
    $('.film-episodes').text(episodes);
  }

  clearSelectedTitle(event) {
    
    // if the button is already disabled, do nothing
    if($(event.target).attr('disabled')) {
      return;
    }

    // disable the clear button
    this.clearButton.setAttribute('disabled', 'disabled');

    // reset title info
    $('.is-link, film-title').removeClass('active');
    $('.tag-title').text('No Title Selected');
    $('.film-subtitle').text('No Series Selected');
    $('.film-img').attr('src', 'http://via.placeholder.com/350x350');
    $('.film-description, .film-rating, .film-native-title, .film-country, .film-title, .film-type, .film-episodes').text('');
    $('.matching-items-list li').remove();
  }
}