export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
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
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.matchingItemsList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
    //find and store other elements you need
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.matchingItemsList.addEventListener('click', this.itemClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearFilters.bind(this));
    //bind the additional event listener for clicking on a series title
  }

  clearFilters() {
    $('.column.content').removeClass('selected')
    $('.column.selected-item').removeClass('selected')
    $('.clear-button').removeClass('selected')
  }

  render() {
    //render the list of tags from this.data into this.tagList
    $('.tag-list').empty()
    const tags = new Set()
    this.data.forEach( (media) => {
      media.tags.forEach( (tag) => tags.add(tag))
    })
    let tagsArray = Array.from(tags).sort()
    tagsArray.forEach( (tag) => {
      $('.tag-list').append(`<li><span class="tag is-link">${tag}</span></li>`);
    })
  }

  tagListClicked(event) {
    $('.column.content').addClass('selected')
    $('.clear-button').addClass('selected')
    $('.active').removeClass('active')
    $('.matching-items-list').empty()
    $('.column.selected-item').removeClass('selected')
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    let button = ( $(event.target).is('span') ? $(event.target) :  $(event.target).find('.tag'))
    button.addClass('active')
    let selectedTag = button.html()
    $('.selected-tag').html(selectedTag)
    let selectedMedia = this.data.filter( (media) => {
      return media.tags.includes(selectedTag)
    })
    // render series
    selectedMedia.forEach( (media) => {
      $('.matching-items-list').append(`<li class="media-title" data-id="${media.id}">${media.title}</li>`)
    })
  }

  itemClicked(event) {
    $('.matching-items-list .active').removeClass('active')
    $('.column.selected-item').addClass('selected')
    $(event.srcElement).addClass('active')
    let selectedMediaId = event.srcElement.attributes['data-id'].value
    let selectedMedia = this.data.find( (media) => {
      return media.id == selectedMediaId
    })
    $('.selected-item .subtitle').html(selectedMedia.title.trim())
    $('.selected-item img').attr("src", selectedMedia.thumbnail)
    $('.selected-item p').html(selectedMedia.description.trim())
    $('.selected-item #rating').html(selectedMedia.rating.trim())
    $('.selected-item #native-title').html(selectedMedia.nativeLanguageTitle.trim())
    $('.selected-item #country').html(selectedMedia.sourceCountry.trim())
    $('.selected-item #media-type').html(selectedMedia.type.trim())
    $('.selected-item #num-episodes').html(selectedMedia.episodes)
  }
}
