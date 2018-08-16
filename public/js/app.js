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

    // just testing out some weird stuff ignore this
    // this.data.forEach( x => {
    //   console.log(x.id, x.title)
    // })

    console.log('Data fetched', this.data[0].tags);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    // Find and store other elements you need
 
    // for the clear button //
    this.clearBtn = this.config.element.querySelectorAll('.clear-button')[0];

    // for the lisit of series //
    this.matchList = this.config.element.querySelectorAll('.matching-items-list')[0];


    // show information // 
    this.rateShow = this.config.element.querySelectorAll('.rate-show')[0];

    this.lngShow =
      this.config.element.querySelectorAll('.lng-show')[0];

    this.ctryShow = this.config.element.querySelectorAll('.ctry-show')[0];

    this.seriesShow = this.config.element.querySelectorAll('.series-show')[0];

    this.epShow = this.config.element.querySelectorAll('.ep-show')[0];


    this.titleShow = this.config.element.querySelectorAll('.title-show')[0];

    this.imgShow = this.config.element.querySelectorAll('.img-show')[0];

    this.descShow = this.config.element.querySelectorAll('.desc-show')[0];



    this.tagChoice = this.config.element.querySelectorAll('.tagChoice')[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series   title (just make event listeners here)
    this.clearBtn.addEventListener('click', this.clearBtnClicked.bind(this));
  }

  render() {
    //render the list of tags from this.data into this.tagList
    const arr = this.data;


    let tagArr = [];
    let allTags = '';

    console.log('started ...')

    arr.forEach(x => {

      x.tags.forEach(y => {

        if (tagArr.indexOf(y) === -1) {
          tagArr.push(y);
        }

      });

    });

    tagArr.forEach(listItem => {
      allTags += `<li><a class='button is-small tag is-link'>${listItem}</a></li>`;
    });

    this.tagList.innerHTML = "";
    this.tagList.innerHTML += allTags;

    // for me to see if the array is coming out properly  '\(-_-)/`
    console.log(tagArr);
    console.log('... finished')
  }


  // click events will just chill down here

  tagListClicked(e) {
    console.log('tag list (or child) clicked', e);
    //check to see if it was a tag that was clicked and render
    let arr = this.data;

    let clickedTag;
    let matchList = [];
    let matchedItems = '';
    let tagChoice = '';
    let curElement = {};

    if (e.target.className === 'is-link') {
      clickedTag = e.target.innerText;

      // for each method to make things a bit easier here "again" -- maybe switch out with a for loopr ??
      arr.forEach( arr => {
        arr.tags.forEach( tag => {

          if (clickedTag === tag) {
            matchList.push(arr);

            matchedItems += `<li class="title is-size-5">${y.title}</li>`;
          }
        });
      });

      this.matchList.innerHTML = "";
      this.matchList.innerHTML = matchedItems;
      this.tagChoice.innerText = clickedTag;

    } else if (e.target.className === 'title') {

      this.tagChoice = e.target.innerText;
      this.data.forEach(x => {

        if (x.title === this.tagChoice) {
          curElement = x;
        }
      });

      //the list of series that have the matching tags
      this.tagChoice.innerText = tagChoice;
      this.seriesShow.innerText = '';
      this.imgShow.setAttribute("src", curElement.thumbnail);
      this.descShow.innerText = curElement.description;
      this.rateShow.innerText = curElement.rating;
      this.lngShow.innerText = curElement.nativeLanguageTitle;
      this.ctryShow.innerText = curElement.sourceCountry;
      this.seriesShow.innerText = curElement.type;
      this.epShow.innerText = curElement.episodes;
    }
  }


  // clear button

  clearBtnClicked(e) {
    let clrTxt =
      `
        <p class="is-size-4 is-full has-text-centered   has-text-weight-light">Please Select a Genre</p>
      `;

    this.matchList.innerHTML = clrTxt;
    this.tagChoice.innerText = '';
    this.seriesShow.innerText = '';
    this.imgShow.setAttribute("src", "http://via.placeholder.com/350x350");
    this.descShow.innerText = '';
    this.rateShow.innerText = '';
    this.lngShow.innerText = '';
    this.ctryShow.innerText = '';
    this.seriesShow.innerText = '';
    this.epShow.innerText = '';
  }

  // // clicking on a title

  // titleClicked(e) {
  //   console.log('the title button was clicked', e);
  // }
}
