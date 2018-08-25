export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.setUniqueTagList.bind(this));

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
    this.matchingItemList = this.config.element.querySelectorAll('.matching-items-list')[0];
  }

  bindEventListeners() {
//    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
//bind the additional event listener for clicking on a series title
    this.tagList.addEventListener('click', function(e) {
      let spanTag = getParentSpan(e.target);
      if(spanTag !== null) {
        $('.subtitle:eq(1)').text('"' + spanTag.textContent + '"');
        removeActiveTags();
        spanTag.classList.add('active');
        setMatchingItemsList(spanTag.textContent);
      }
    }, false);

    var setMatchingItemsList = (selectedTag) => {
      let matchingItemsTags = [];
      this.data.forEach(dataElement => {
        if(dataElement.tags.includes(selectedTag)) {
          let tagObject = {};
          tagObject.id = dataElement.id;
          tagObject.title = dataElement.title;
          matchingItemsTags.push(tagObject);
        }
      });
      $( ".matching-items-list" ).empty();
      matchingItemsTags.forEach(matchingItemTag => {
        $( ".matching-items-list" ).append( "<li><a id='" + matchingItemTag.id + "' href='#' onClick='setMatchingItemActive(this)'>" + matchingItemTag.title + "</a></li>" );
      })
    }
  
    this.matchingItemList.addEventListener('click', function(e) {
      let listItemTag = getParentListItem(e.target);
      if(listItemTag !== null) {
        $('.subtitle:eq(2)').text(listItemTag.textContent);
        setMatchingSeriesData(e.target.id);
        document.querySelector('.clear-button').classList.remove('is-disabled');
      }
    }, false);

    var setMatchingSeriesData = (selectedSeriesId) => {
      this.data.forEach(dataElement => {
        if(dataElement.id == selectedSeriesId) {
          $('.selected-item > div > img').attr("src", dataElement.thumbnail);
          $('.selected-item > div > p').text(dataElement.description);
          $('.selected-item > ul').empty();
          $('.selected-item > ul').append("<li><strong>Rating:</strong> <span>" + dataElement.rating + "</span></li>");
          $('.selected-item > ul').append("<li><strong>Native Language Title:</strong> <span>" + dataElement.nativeLanguageTitle + "</span></li>");
          $('.selected-item > ul').append("<li><strong>Source Country:</strong> <span>" + dataElement.sourceCountry + "</span></li>");
          $('.selected-item > ul').append("<li><strong>Type:</strong> <span>" + dataElement.type + "</span></li>");
          $('.selected-item > ul').append("<li><strong>Episodes:</strong> <span>" + dataElement.episodes + "</span></li>");
        }
      });
    }
    
  }


  setUniqueTagList() {
    let uniqueTags = [];
    this.data.forEach(dataElement => {
      uniqueTags = [...new Set([...uniqueTags, ...dataElement.tags])];
    });
    uniqueTags.sort();
    $( ".tag-list" ).empty();
    uniqueTags.forEach(tag => {
      $( ".tag-list" ).append( "<li><span class='tag is-link'>" + tag + "</span></li>" );
    })
  }
  
}
