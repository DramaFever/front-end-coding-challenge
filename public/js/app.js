import templateRender from '/js/templateRender.js'

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
  }

  reloadElements() {
    this.tagListItems = this.config.element.querySelectorAll('.tag')

    // Cached jquery objects.
    this.$tagListItems = $(this.tagListItems)
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.tags = this.extractTags(this.data)
    this.tagList.innerHTML = templateRender.tagsMarkup(this.tags)
  }

  /**
   * Remove tags
   * @param {Object} array of items.
   * @return {Object} array of sorted, unique tags pulled from items.
   */
  extractTags(items) {
    let tags = []
    items.forEach(item => {
      tags = tags.concat(item.tags)
    })
    return tags.unique().sort()
  }

  tagListClicked(event) {
    const $target = $(event.target)
    if ($target[0].nodeName !== 'SPAN' || $target.hasClass('active')) {
      return false
    }

    // Deactivate everything, toggle active on target.
    this.$tagListItems.toggleClass('active', false)
    $target.toggleClass('active', true)
    
    console.log('tag list item clicked ->', $target);
    
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }

  setSelectedTag($tagItem) {
    const tagTitle = $tagItem.text()

  }
}
