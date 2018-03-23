import Templating from '/js/Templating.js'
import DataHandler from '/js/DataHandler.js'

export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this))
      .then(this.reloadElements.bind(this));
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.dataHandler = new DataHandler(data)
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
    this.selectedSeriesContainer.innerHTML = Templating.generateSeriesMarkup()
    // grab the first `active` and pretend it was clicked on
    // this.tagWasClicked(this.tags[0])
  }

  bindEventListeners() {
    window.addEventListener('load', this.checkHashStatus.bind(this))
    window.addEventListener('popstate', this.checkHashStatus.bind(this))

    this.tagList.addEventListener('click', this.tagListClicked.bind(this))
    this.titlesList.addEventListener('click', this.titleListClicked.bind(this))
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this))
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.tags = this.dataHandler.extractTags()
    this.tagList.innerHTML = Templating.generateTagsMarkup(this.tags, false)
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
    this.pushState($target.data('id'))
    this.titleListWasClicked($target.data('id'))
  }

  // Templating after click events.
  tagWasClicked(tag) {
    const matchedSeries = this.dataHandler.findByTag(tag)
    this.selectedTagTitle.innerText = `"${tag}"`
    this.titlesList.innerHTML = Templating.generateTitlesMarkup(matchedSeries, false)
    this.setBrowserActive(true)
  }

  titleListWasClicked(titleId) {
    const seriesData = this.dataHandler.findById(titleId)
    this.selectedSeriesContainer.innerHTML = Templating.generateSeriesMarkup(seriesData)
  }

  pushState(id) {
    window.history.pushState(null, null, `#${id}`)
  }

  // Kicked off during any dom load and on pop states. Checks for a hash, if it's valid, 
  // show the active series. Otherwise kick back to the homepage.
  checkHashStatus(event) {
    const seriesId = document.location.hash.replace('#', '')
    if (seriesId === '') {
      this.clearButtonClicked()
      this.setBrowserActive(false)
      return false
    }

    // Find the series with the ID.
    // If the series doesn't exist (like if some prankster were to change the ID # in the url...), 
    // kick them back to the homepage.
    const series = this.dataHandler.findById(parseInt(seriesId))
    if (Object.keys(series).length === 0) {
      document.location = '/'
      return false
    }

    // Render out an series title object for just the series in question, since it's a little 
    // out of scope to maintain the tag selection history along with the series selection.
    this.titlesList.innerHTML = Templating.generateSelectedSeries(series, false)
    this.titleListWasClicked(parseInt(seriesId))

    // Toggle the Clear button visibility.
    this.setBrowserActive(true)
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
  
  clearButtonClicked() {
    // Re-render the list
    this.render()
    this.reloadElements()
    this.selectedSeriesContainer.innerHTML = Templating.generateSeriesMarkup()
    this.setBrowserActive(false)
  }
}
