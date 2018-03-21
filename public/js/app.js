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
    this.data = this.mapTagsToSeries(data)
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    //find and store other elements you need
    this.seriesList = this.config.element.querySelectorAll('.matching-items-list')[0]
    this.seriesListSubtitle = this.seriesList.previousElementSibling
    this.selectedItem = this.config.element.querySelectorAll('.selected-item')[0]
    this.selectedItemSubtitle = this.selectedItem.querySelectorAll('.subtitle')[0]
    this.selectedItemImage = this.selectedItem.querySelectorAll('img')[0]
    this.selectedItemDesc = this.selectedItem.querySelectorAll('p')[0]
    this.selectedItemMeta = this.selectedItem.querySelectorAll('ul')[0].children
    this.clearDisplayBtn = this.config.element.querySelectorAll('.clear-button')[0]
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    //bind the additional event listener for clicking on a series title
  }

  render() {
    //render the list of tags from this.data into this.tagList
  }

  tagListClicked(event) {
    console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }
  mapTagsToSeries(data) {
    let mapping = new Map();
    data.forEach((series) => {
      series.tags.forEach((tag)=> {
        if (mapping.has(tag)) {
          mapping.set(tag, [...mapping.get(tag), series])
        } else {
          mapping.set(tag, [series])
        }
      })
    })
    return mapping = new Map([...mapping.entries()].sort());
  }
}
