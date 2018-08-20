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
    this.tags = this._unique(this._combineFromObjectProp(data, 'tags'));
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    //find and store other elements you need
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.tags.forEach(tag => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      li.appendChild(span);
      span.setAttribute('class', 'tag is-link');
      span.innerHTML = tag.toLowerCase();
      this.tagList.appendChild(li);
    });
  }

  tagListClicked(event) {
    console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render

    //the list of series that have the matching tags
  }

  _unique(array) {
    return Array.from(new Set(array));
  }

  _combineFromObjectProp(array, prop) {
    return array.reduce((vals, item) => vals.concat(item[prop]), []);
  }
}
