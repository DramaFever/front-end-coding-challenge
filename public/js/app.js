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

    // for dropdown
    this.drpDwn = this.config.element.querySelectorAll('.dropdown')[0];
    // for the taglist
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    // for the lisit of series //
    this.matchList = this.config.element.querySelectorAll('.matching-items-list')[0];


    // Find and store other elements you need
 
    // for the clear button //
    this.clearBtn = this.config.element.querySelectorAll('.clear-button')[0];


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

    this.matchList.addEventListener('click', this.tagListClicked.bind(this));
    //bind the additional event listener for clicking on a series   title (just make event listeners here)
    
    this.clearBtn.addEventListener('click', this.clearBtnClicked.bind(this));

    // for dropdown button list
    this.drpDwn.addEventListener('click', this.drpDwnClicked.bind(this));
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
      let li = listItem;

      allTags += `<a href="#" class='dropdown-item'>${li}</a>`;
    });

    this.tagList.innerHTML = "";
    this.tagList.innerHTML += allTags;

    // for me to see if the array is coming out properly  
    // '\(-_-)/`
    console.log("tag list: ", tagArr);
    console.log('... finished')
  }


  // click events will just chill down here

  tagListClicked(e) {
    //console.log(e.target.className);
    //check to see if it was a tag that was clicked and render
    let arr = this.data;
    let clickedTag;
    let matchList = [];
    let matchedItems = '';
    let tagChoice = '';
    let curElement = {};

    if (e.target.className === 'dropdown-item') {

      // seeing exactly what it is that I'm getting in the console.log because something isn't working right...
      //console.log('link clicked!');

      // being completely lazy here >:()
      clickedTag = e.target.innerText;

      // now seeing if I'm getting the right information in the console.log from clickedTag
      //console.log(clickedTag);

      // for each method to make things a bit easier here "again" -- maybe switch out with a for loop, foreach maybe a bit expensive in a practical situation??
      arr.forEach(arr => {
        arr.tags.forEach(tag => {

          //if the value clickedTag value is the same as the tag
          if (clickedTag === tag) {

            // push it real good... to the array that was init of course >_>
            matchList.push(arr);

            // template thing -- might change this doesn't seem right
            matchedItems += `
            <a class="box is-size-5">
              ${arr.title}
            </a>
            `;
          }
        })
      })

      this.matchList.innerHTML = "";
      this.matchList.innerHTML = matchedItems;
      this.tagChoice.innerText = clickedTag;

    } else if (e.target.className === 'box is-size-5') {
      // seeing if the clink gets clicked at all
      console.log('title clicked!');

      // renaming again because I'm lazy
      this.tagChoice2 = e.target.innerText;

      //console.log(this.tagChoice);

      // what to do with the data???
      arr.forEach(x => {
        if (x.title === this.tagChoice2) {
          curElement = x;
          
        }
      });
      console.log("here: ", curElement);

      //the list of series that have the matching tags
      this.titleShow.innerText = this.tagChoice2;
      this.imgShow.setAttribute("src", curElement.thumbnail);
      this.descShow.innerHTML = curElement.description;
      this.rateShow.innerHTML = curElement.rating;
      this.lngShow.innerHTML = curElement.nativeLanguageTitle;
      this.ctryShow.innerHTML = curElement.sourceCountry;
      this.seriesShow.innerHTML = curElement.type;
      this.epShow.innerHTML = curElement.episodes;
    }
  }

  // clear button
  clearBtnClicked(e) {
    
    // this value will disable the clear button in the beginning when there isn't a value set (if i have time).The logic i;m think just incase i forget: when the app is init, this class is already set to true, so the button can't be clicked. but when a tag is seleceted then it will be set to false and then clicking clear will, in turn, set the value back to true. Remeber that you need a global value initilized somewhere outside of clearBtnClicked()...
    let isClr = true;

    // if there's enough time add this in and fix it -- if not do it later for fun to see if this is the right way to get it working
    
    // if (isClr == true) {
    //   this.clearBtn.classList.toggle('disabled');
    //     isClr = false;
    //     console.log('disabled');

    // } else if (isClr == false){
    //   this.drpDwn.classList.toggle('is-active');
    //   console.log('toggled off');
    // }

    // when its cleared it'll set the tagselected value to false. ditto...
    let isSel = false;

    // values that I'm using to help make my life a bit more 'organized'
    let clrTxt = 'Please Select Category';
    let clrTxt2 = '<p class="has-text-centered">(No Titles)</p>';

    // Values that will be set once the list is reset/ cleared
    this.matchList.innerHTML = clrTxt2; // inside title div
    this.tagChoice.innerHTML = clrTxt; // Title of list
    this.titleShow.innerHTML = "Please Select a Title";
    this.seriesShow.innerText = ''; // series Type
    this.imgShow.setAttribute("src", "http://via.placeholder.com/350x350"); // series image
    this.descShow.innerHTML = `<p class="has-text-centered">No Description Available</p>`; // series description
    this.rateShow.innerText = ''; // series rating
    this.lngShow.innerText = ''; // series language
    this.ctryShow.innerText = ''; // series country
    this.seriesShow.innerText = ''; // series
    this.epShow.innerText = ''; // how many episodes
  }

  // tag list drop down
  drpDwnClicked(){
    const el = this.drpDwn.className;
    // to help me see what its showing
    //console.log(el)

    if (el == 'dropdown') {
      this.drpDwn.classList.toggle('is-active');
      console.log('toggled on');
    } else {
      this.drpDwn.classList.toggle('is-active');
      console.log('toggled off');
    }

  }

  // blurDiv(){
  //   this.drpDwn.classList.toggle();
  // }

}
