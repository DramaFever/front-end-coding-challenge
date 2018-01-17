export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.tags = [];

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.parseTags.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this));
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.data = data;
  }

  parseTags() {
    this.tags = [];
    this.data.forEach((item) => {
      item.tags.forEach((tag) => {
        if (this.tags.indexOf(tag) === -1) {
          this.tags.push(tag);
        }
      });
    });
    this.tags.sort();
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.seriesList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.selectedTag = this.config.element.querySelectorAll('.selected-tag')[0];
    this.seriesInfo = this.config.element.querySelectorAll('.selected-item')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
    //find and store other elements you need
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
    this.seriesList.addEventListener('click', this.seriesListClicked.bind(this));

    this.clearButton.addEventListener('click', this.clear.bind(this));
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.tagList.innerHTML = '';
    this.tags.forEach(tag => {
      this.tagList.innerHTML += `<li><a href="#" class="tag is-link" data-tag="${tag}">${tag}</a></li>`;
    });
  }

  tagListClicked(event) {
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    if (event.srcElement.nodeName === 'A') {
      const tag = event.srcElement.dataset.tag;
      this.selectTag(tag);
    }
  }

  seriesListClicked(event) {
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    if (event.srcElement.nodeName === 'A') {
      const seriesId = Number(event.srcElement.dataset.id);
      this.selectSeries(seriesId);
    }
  }

  selectTag(tag) {
    this.selectedTag.innerHTML = tag ? `"${tag}"` : 'No Tag Selected';
    this.seriesList.innerHTML = '';

    $('.tag').removeClass('active');

    if (tag) {
      $(`.tag[data-tag="${tag}"]`).addClass('active');
    }
    this.data.forEach(series => {
      if (series.tags.indexOf(tag) > -1) {
        this.seriesList.innerHTML += `<li><a href="#" class="series-list-item" data-id="${series.id}">${series.title}</a></li>`;
      }
    });
  }

  selectSeries(seriesId) {
    this.selectedSeries = {};

    this.data.forEach(series => {
      if (series.id === seriesId) {
        this.selectedSeries = series;
      }
    });

    if (this.selectedSeries) {
      $('.series-list-item').removeClass('active');
      $(`.series-list-item[data-id="${this.selectedSeries.id}"]`).addClass('active');
    }

    const find = qs => {
      return this.seriesInfo.querySelectorAll(qs)[0];
    };

    find('[data-title]').innerHTML = this.selectedSeries.title || 'No Series Selected';

    find('[data-thumbnail]').src = this.selectedSeries.thumbnail || 'http://via.placeholder.com/350x350';

    find('[data-description]').innerHTML = this.selectedSeries.description || '';
    find('[data-rating]').innerHTML = this.selectedSeries.rating || '';
    find('[data-native-title]').innerHTML = this.selectedSeries.nativeLanguageTitle || '';
    find('[data-source-country]').innerHTML = this.selectedSeries.sourceCountry || '';
    find('[data-type]').innerHTML = this.selectedSeries.type || '';
    find('[data-episodes]').innerHTML = this.selectedSeries.episodes || '';
  }

  clear() {
    this.selectSeries(null);
    this.selectTag(null);
  }

}
