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
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    //find and store other elements you need
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];

    // Clone elements to reset them on 'Clear'
    this.selectedTagElement = $('.selected-tag-element').clone();
    this.selectedShowElement = $('.selected-item').clone();
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this));
  }

  // Returns an array of sorted, non duplicate tags
  getTagsList() {
    let tags = [];
    // Get the list of all tags
    this.data.forEach((show) => {
      $.merge(tags, show.tags);
    })
    // Remove Duplicates Tags
    tags = $.grep(tags, (v, k) => {
        return $.inArray(v ,tags) === k;
    });
    // Sort Tags Alphabetically
    tags.sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    return tags;
  }

  render() {
    $(this.clearButton).attr('disabled', true);
    let tags = this.getTagsList();
    let tagListElement = $(this.tagList);
    tagListElement.empty();

    // Render the tag elements
    tags.forEach((value) => {
      let tagId = value.split(' ').join('');
      let tagElement = `<li><span class="tag is-link" id="${tagId}">${value}</span></li>`;
      tagListElement.append(tagElement);
    });
  }

  // Click handler for tags list
  tagListClicked(event) {
    $(this.clearButton).attr('disabled', false);
    let self = this;
    let selectedTag = event.target.innerText;
    let showsListElement = $('.matching-items-list');
    let showsForThisTag = [];

    showsListElement.empty();
    // Update the selected tag heading
    $('#selected-tag-name').text(`"${selectedTag}"`);

    // Set the active class on the current tag and remove from others
    $('#' + event.target.id).addClass('active').parent().siblings().find('.active').removeClass('active');
    
    // Render the list of shows that have the currently selected tag
    this.data.forEach((show) => {
      if(show.tags.indexOf(selectedTag) > -1) {
        let showElement = `<li data-show-id="${show.id}" id="${show.id}">${show.title}</li>`;
        showsListElement.append(showElement);
        $('#' + show.id).data('data-show', show);
        $('#' + show.id).click(self.showClicked);
      }
    });
  }

  // Click Handler for show title click
  showClicked(event) {
    let selectedShowObj = $(this).data("data-show");

    // Set show details
    $(this).addClass('active').siblings().removeClass('active');
    $('.selected-item').find('#title').text(selectedShowObj.title);
    $('.selected-item').find('#thumbnail').attr("src",selectedShowObj.thumbnail);
    $('.selected-item').find('#description').text(selectedShowObj.description);
    $('.selected-item').find('#rating').text(selectedShowObj.rating);
    $('.selected-item').find('#native-language-title').text(selectedShowObj.nativeLanguageTitle);
    $('.selected-item').find('#source-country').text(selectedShowObj.sourceCountry);
    $('.selected-item').find('#type').text(selectedShowObj.type);
    $('.selected-item').find('#episodes').text(selectedShowObj.episodes);
  }

  // Click Handler for 'Clear' button
  clearButtonClicked(event) {
    // remove the active class
    $('.tag-list').find('.active').removeClass('active');
    // reset UI to original state
    $(".selected-tag-element").replaceWith(this.selectedTagElement.clone());
    $(".selected-item").replaceWith(this.selectedShowElement.clone());
    $(this.clearButton).attr('disabled', true);    
  }
}
