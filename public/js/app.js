export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this))
      .then(this.resetData.bind(this));
    this.listTags = [];
    this.seriesList = [];
  }

  resetData() {

    let obj = {
      "tag": "No Tag Selected",
      "type": "",
      "rating": "",
      "episodes": "",
      "sourceCountry": "",
      "description": "",
      "title": "No Series Selected",
      "nativeLanguageTitle": "",
      "thumbnail": "http://via.placeholder.com/350x350"
    };

    for (var key in obj) {
      if (this.config.element.querySelector('#' + key) && key !== 'thumbnail') {
        this.config.element.querySelector('#' + key).innerHTML = obj[key];
      } else if (key === 'thumbnail') {
        this.config.element.querySelector('#' + key).src = obj[key];
      }
    }
    $('.tag,.tag-list').removeClass("active");
    this.seriesEList.innerHTML = '';
    $(this.clearBtn).addClass('disabled');
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.data = data;
  }

  getElements() {
    //find and store other elements you need
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.seriesEList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.clearBtn = this.config.element.querySelector('.clear-button');
  }

  bindEventListeners() {
    //bind the additional event listener for clicking on a series title
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.seriesEList.addEventListener('click', this.seriesListClicked.bind(this));
    this.clearBtn.addEventListener('click', this.resetData.bind(this));
  }

  render() {
    //render the list of tags from this.data into this.tagList
    let str = '';
    this.data.forEach((val) => {
      val.tags.forEach((tag) => {
        if (this.listTags.indexOf(tag) === -1) {
          this.listTags.push(tag);
        }
      });
    });
    let taglist = this.listTags.sort();
    taglist.forEach((val) => {
      str += '<li><span class="tag is-link">' + val + '</span></li>';
    });
    this.tagList.innerHTML = str;
  }

  tagListClicked(event) {
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    let str = '';
    this.seriesList = [];
    if (event.target.tagName === 'SPAN') {
      if (event.target.className.indexOf('tag') !== -1) {
        $('.tag,.tag-list').removeClass("active");
        $(event.target).addClass("active");
      }

      this.config.element.querySelector('#tag').innerHTML = '"'+event.target.textContent+'"';
      this.data.forEach((val) => {
        if (val.tags.indexOf(event.target.textContent) !== -1) {
          this.seriesList.push(val.title);
        }
      });
      $(this.clearBtn).removeClass('disabled');
      this.seriesList.forEach((val) => {
        str += '<li><a><span class="series-items-list">' + val + '</span></a></li>';
      });
      this.seriesEList.innerHTML = str;
    }
  }

  seriesListClicked(event) {
    if (event.target.tagName === 'SPAN') {
      $('.series-items-list').removeClass("active");
      $(event.target).addClass("active");
      let obj = {};
      this.data.forEach((val) => {
        if (val.title === event.target.textContent) {
          obj = val;
        }
      });
      for (var key in obj) {
        if (this.config.element.querySelector('#' + key) && key !== 'thumbnail') {
          this.config.element.querySelector('#' + key).innerHTML = obj[key];
        } else if (key === 'thumbnail') {
          this.config.element.querySelector('#' + key).src = obj[key];
        }
      }
    }
  }
}
