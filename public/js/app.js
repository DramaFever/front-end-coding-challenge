export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this))
      .then(this.setDefault.bind(this));

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
    this.tags = this._unique(this._combineFromObjectProp(data, 'tags'));
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    //find and store other elements you need
    this.seriesList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
    this.seriesList.addEventListener('click', this.seriesListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearAll.bind(this));
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this._renderTags.call(this);
  }

  tagListClicked(event) {
    console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render
    if (event.toElement.className !== 'tag is-link') return;
    //the list of series that have the matching tags
    this._setSelectedTag.call(this, event.path[0].dataset.tagName);
  }

  seriesListClicked(event) {
    console.log('series list (or child) clicked', event);
    //check to see if it was a series that was clicked and render
    if (event.toElement.className !== 'series is-link') return;
    //the list of series that have the matching tags
    this._setSelectedSeries.call(this, event.path[0].dataset.seriesId);
  }

  setDefault() {
    this._setSelectedTag.call(this, this.tags[0].toLowerCase());
    this._setSelectedSeries.call(this, this.seriesForTag[0].id);
  }

  clearAll() {
    this._clearSelectedTag();
    this._clearSelectedSeries();
    this._clearSeriesForTag();
  }

  _clearSelectedTag() {
    delete this.selectedTag;

    const selectedTags = document.getElementsByClassName('tag is-link selected');
    [].forEach.call(selectedTags, tag => {
      tag.classList.remove('selected');
    });

    const selectedTag = document.getElementsByClassName('selected-tag')[0];
    selectedTag.innerHTML = 'Series';
  }

  _clearSelectedSeries() {
    // delete this.selectedSeries;
    const selectedSeries = document.getElementsByClassName('series is-link selected');
    [].forEach.call(selectedSeries, series => {
      series.classList.remove('selected');
    });

    const selectedSeriesTitle = document.getElementsByClassName('selected-series')[0];
    selectedSeriesTitle.innerHTML = 'Selected Series';

    const selectedSeriesContent = document.getElementsByClassName('selected-series-content');
    [].forEach.call(selectedSeriesContent, contentBlock => {
      contentBlock.classList.add('hide');
    });

    document.getElementById('no-series-selected').classList.remove('hide');
  }

  _clearSeriesForTag() {
    while (this.seriesList.firstChild) {
      this.seriesList.removeChild(this.seriesList.firstChild);
    }
    // 'no series selected'
    document.getElementById('no-tag-selected').classList.remove('hide');
  }

  _createSeriesListItem(series) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    li.appendChild(span);
    span.setAttribute('class', 'series is-link');
    span.setAttribute('data-series-id', series.id);
    span.innerHTML = series.title;
    return li;
  }

  _createTagListItem(tag) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    li.appendChild(span);
    span.setAttribute('class', 'tag is-link');
    span.setAttribute('data-tag-name', tag.toLowerCase());
    span.innerHTML = tag.toLowerCase();
    return li;
  }

  _renderTags() {
    this.tags.forEach(tag => {
      const listItem = this._createTagListItem.call(this, tag);
      this.tagList.appendChild(listItem);
    });
  }

  _renderSeries() {

    document.getElementById('no-series-selected').classList.add('hide');

    const selectedSeriesContent = document.getElementsByClassName('selected-series-content');
    [].forEach.call(selectedSeriesContent, contentBlock => {
      contentBlock.classList.remove('hide');
    });

    const image = document.getElementById('series-image');
    image.setAttribute('src',this.selectedSeries.thumbnail);
    const update = {
      description: 'series-description',
      rating: 'series-rating',
      nativeLanguageTitle: 'series-native-title',
      sourceCountry: 'series-source-country',
      type: 'series-type',
      episodes: 'series-episodes'
    };
    let fieldNode;
    for (const field in update) {
      fieldNode = document.getElementById(update[field]);
      fieldNode.innerHTML = this.selectedSeries[field];
    }
  }

  _renderSeriesForTag() {
    this._clearSeriesForTag();
    document.getElementById('no-tag-selected').classList.add('hide');
    this.seriesForTag.forEach(series => {
      const listItem = this._createSeriesListItem.call(this, series);
      this.seriesList.appendChild(listItem);
    });
  }

  _setSelectedTag(tagName) {
    this._clearSelectedTag.call(this);
    this.selectedTag = tagName;
    const selectedTag = document.getElementsByClassName('selected-tag')[0];
    selectedTag.innerHTML = tagName;
    const tag = document.querySelectorAll('[data-tag-name="'+tagName+'"]')[0];
    tag.classList.add('selected');
    this._setSeriesForTag.call(this);
    this._setSelectedSeries.call(this, this.seriesForTag[0].id);
  }

  _setSelectedSeries(seriesId) {
    this._clearSelectedSeries.call(this);
    this.selectedSeries = this.data.find(series => +series.id === +seriesId);
    const selectedTag = document.getElementsByClassName('selected-series')[0];
    selectedTag.innerHTML = this.selectedSeries.title;
    const series = document.querySelectorAll('[data-series-id="'+seriesId+'"]')[0];
    series.classList.add('selected');
    this._renderSeries.call(this);
  }

  _setSeriesForTag() {
    this.seriesForTag = this.data.filter(series => {
      return series.tags.map(tag=>tag.toLowerCase()).includes(this.selectedTag)
    });
    this._renderSeriesForTag.call(this);
  }

  _unique(array) {
    return Array.from(new Set(array));
  }

  _combineFromObjectProp(array, prop) {
    return array.reduce((vals, item) => vals.concat(item[prop]), []);
  }
}
