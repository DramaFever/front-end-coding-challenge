import templating from '/js/templating.js'
import dataHandler from '/js/dataHandler.js'

export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.attachPrototypes()

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this))
      .then(this.reloadElements.bind(this));

    console.log('Widget Instance Created');
  }

  attachPrototypes() {
    Array.prototype.unique = function() {
      return this.filter((val, i, self) => {
        return self.indexOf(val) === i
      })
    }
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
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.titlesList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.selectedTagTitle = this.config.element.querySelectorAll('.content .subtitle')[1];
    this.selectedSeriesTitle = this.config.element.querySelectorAll('.content .subtitle')[2];
    this.selectedSeriesContainer = this.config.element.querySelectorAll('.selected-item')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
  }

  reloadElements() {
    this.tagListItems = this.config.element.querySelectorAll('.tag')

    // Cached jquery objects.
    this.$tagListItems = $(this.tagListItems)

    this.titlesList.innerHTML = ''
    this.selectedTagTitle.innerText = 'No Tag Selected'
    this.selectedSeriesTitle.innerText = 'No Series Selected'
    this.selectedSeriesContainer.innerHTML = templating.generateSeriesMarkup()
    // grab the first `active` and pretend it was clicked on
    // this.tagWasClicked(this.tags[0])
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.titlesList.addEventListener('click', this.titleListClicked.bind(this))
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this))
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.tags = dataHandler.extractTags(this.data)
    this.tagList.innerHTML = templating.generateTagsMarkup(this.tags, false)
  }

  // Handlers for click events.
  tagListClicked(event) {
    const $target = $(event.target)
    if ($target[0].nodeName !== 'SPAN' || $target.hasClass('active')) {
      return false
    }

    // Deactivate everything, toggle active on target.
    this.toggleActive(this.$tagListItems, $target)

    const targetTag = $target.text().trim()
    this.tagWasClicked(targetTag)
  }

  titleListClicked(event) {
    const $target = $(event.target)
    if ($target[0].nodeName !== 'A' || $target.hasClass('active')) {
      return false
    }

    const $matchingItems = $('.matching-items-list a')
    this.toggleActive($matchingItems, $target)
    this.titleListWasClicked(event)
  }

  // Templating after click events.
  tagWasClicked(tag) {
    const matchedSeries = dataHandler.findByTag(this.data, tag)
    this.selectedTagTitle.innerText = `"${tag}"`
    this.titlesList.innerHTML = templating.generateTitlesMarkup(matchedSeries, false)
    this.setBrowserActive(true)
  }

  titleListWasClicked(event) {
    const $target = $(event.target)
    const seriesData = dataHandler.findById(this.data, $target.data('id'))
    this.selectedSeriesContainer.innerHTML = templating.generateSeriesMarkup(seriesData)
  }

  toggleActive(deactivateItems, target) {
    deactivateItems.toggleClass('active', false)
    target.toggleClass('active', true)
  }

  setBrowserActive(active) {
    if (active) {
      this.config.element.classList.add('tag-browser-active')
    } else {
      this.config.element.classList.remove('tag-browser-active')
    }
  }
  
  // TODO : uhh make this work ?
  clearButtonClicked() {
    // Re-render the list
    this.render()
    this.reloadElements()
    this.selectedSeriesContainer.innerHTML = templating.generateSeriesMarkup()
    this.setBrowserActive(false)
  }
}
