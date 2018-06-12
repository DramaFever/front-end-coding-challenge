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
    this.titleList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.titleList.addEventListener('click', this.tagListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearSelectedValues.bind(this));
  }

  render() {
    //render the list of tags from this.data into this.tagList
    var tagsList = [];
    var liData = '';
    this.data.forEach(function(item) {
      item.tags.forEach(function(tag) {
        if(tagsList.indexOf(tag) === -1) {
          tagsList.push(tag);
        }
      });
    });
    tagsList.sort();
    tagsList.forEach(function(item) {
      liData += "<li><span class='tag is-link'>"+item+"</li>";
    });
    $(this.tagList).append(liData);
    console.log('tagList is '+tagsList);
  }

  tagListClicked(event) {    
    var clickedTag;
    var matchedList = [];
    var matchedItems = '';
    var selectedSeries = '';
    var currentElement = {};
    if(event.srcElement.className === 'tag is-link') {
      clickedTag = event.srcElement.innerText;
      this.data.forEach(function(item) {
        item.tags.forEach(function(tag) {
          if(clickedTag === tag) {
            matchedList.push(item);
            matchedItems += "<li class='title'>"+item.title+"</li>";
          }
        });
      });
      $('.matching-items-list').empty();
      $('.matching-items-list').append(matchedItems);
      $('.selected-tag').text(clickedTag);
    }
    else if(event.srcElement.className === 'title') {
      selectedSeries = event.srcElement.innerText;
      this.data.forEach(function (item) {
        if(item.title === selectedSeries) {
          currentElement = item;
        }
      });
      $('.selected-series').text(selectedSeries);
      $('.series-img').attr('src',currentElement.thumbnail);
      $('.series-desc').text(currentElement.description);
      $('.series-rating').text(currentElement.rating);
      $('.series-language').text(currentElement.nativeLanguageTitle);
      $('.series-country').text(currentElement.sourceCountry);
      $('.series-type').text(currentElement.type);
      $('.series-episodes').text(currentElement.episodes);
    }
  }

  clearSelectedValues(event) {
    $('.matching-items-list').empty();
    $('.selected-tag').text('');
    $('.selected-series').text('');
    $('.series-img').attr('src','http://via.placeholder.com/350x350');
    $('.series-desc').text('');
    $('.series-rating').text('');
    $('.series-language').text('');
    $('.series-country').text('');
    $('.series-type').text('');
    $('.series-episodes').text('');
  }

}
