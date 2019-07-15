export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.selectedTagItem = ''
    this.selectedSeriesItem = ''
    this.selectedTagTitle = ''
    this.selectedSeriesTitle = ''
    this.handleClearButtonClick = this.clearButtonClicked.bind(this);
    this.noTagSelectedText = `No Tag Selected`
    this.noSeriesText = `<h3 class='subtitle'>No Series selected</h3>`

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
    // gets the tag list element which displays the different tags
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    // gets the tag title element - place where the title of selected tag will be displayed
    this.tagTitle = this.config.element.querySelector('.column.content .subtitle');
    // gets the series list element which displays list of series based on the selected tage
    this.seriesList = this.config.element.querySelector('.matching-items-list');
    // gets the serial detail element which displays details of the selected serial
    this.selectedSeriesDetail = this.config.element.querySelector('.selected-item');
    // gets clear button element which resets the widget
    this.clearButton = this.config.element.querySelector('.clear-button');
    // by default when page loads the clear button will be disabled
    this.clearButton.setAttribute('disabled','');
    //find and store other elements you need
  }

  bindEventListeners() {

    // add event listener for when item in tag list or series list is clicked.
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.seriesList.addEventListener('click',this.seriesListClicked.bind(this));
    

    //bind the additional event listener for clicking on a series title
  }

  /*
    getTagList - function which gets the distinct tags that needs to be displayed
  */
  getTagList(){
   
    // Set by default only stores unique values.
    let tagListSet = new Set();

    this.data.forEach(data => {
      data.tags.forEach(tag => {
        tagListSet.add(tag);
      })
    })


    return tagListSet;

  }


  render() {
    //render the list of tags from this.data into this.tagList
    let tagListHtml = '';
    // sort the tag list 
    const tagList = Array.from(this.getTagList()).sort();

    // add each tag in list element
    tagList.forEach(tag =>{
      tagListHtml += `<li><span class="tag is-link">${tag}</span></li>`;
    })

    // set the tag list to be displayed and also set "selected tag" and "selected series" to none
    this.tagList.innerHTML = tagListHtml;
    this.tagTitle.innerHTML = this.noTagSelectedText;
    this.selectedSeriesDetail.innerHTML =  this.noSeriesText;
  
  }

   /*
    renderSeriesList - function which renders the list of series on the basis of selected tag
    seriesList - the list of the series that needs to be rendered.
  */
  renderSeriesList(seriesList) {
    let seriesListHtml = '';
    
    // remove existing animation
    seriesList.forEach(series =>{
      seriesListHtml += `<li><a data-id="${series.id}" class="series-name">${series.title}</a></li>`;
    });

    this.seriesList.innerHTML = seriesListHtml;

    
    

  }

  /*
    renderSeriesList - function which renders the series details based on selected series
    series - the series information that needs to be rendered.
  */
  renderSeries (series) {
    const selectedSeriesDetailHtml = 
      `<div class="content">
        <h3 class="subtitle">${series.title}</h3>
        <img alt="${series.title}" src="${series.thumbnail}"  />
        <p>${series.description}</p>
      </div>
      <ul>
        <li><strong>Rating:</strong> <span>${series.rating}</span></li>
        <li><strong>Native Language Title:</strong> <span>${series.nativeLanguageTitle}</span></li>
        <li><strong>Source Country:</strong> <span>${series.sourceCountry}</span></li>
        <li><strong>Type:</strong> <span>${series.type}</span></li>
        <li><strong>Episodes:</strong> <span>${series.episodes}</span></li>
      </ul>`;
      
    this.selectedSeriesDetail.innerHTML = selectedSeriesDetailHtml;

  }

  /*
    tagListClicked - function that is called when tag list item is clicked
    event - an object that contains information on what type of event is triggered and also node information on where the event is triggered
  */
  tagListClicked(event) {
    let seriesList = []
    let selectedTag = '';
    //check to see if it was a tag that was clicked 
    if(event.target.className.indexOf('tag') !== -1){

      // if tag was already selected remove the selection.
      if(this.selectedTagItem !== ''){
        this.removeCurrentSelectedTag();
      }
      // if a series was selected based on an existing tag selection , remove the series information
      if(this.selectedSeriesItem !== ''){
        this.selectedSeriesDetail.classList.remove('fadeIn');
        this.clearSeriesInfoWithTimeout(100);
      }

      // store the current selected tag information and add active class
      this.selectedTagItem = event.target;
      event.target.classList.add('active');


      // get the selected tag text and filter based on it to get the list of series that matches the selected tag
      selectedTag = event.target.textContent;
      seriesList = this.data.filter( data => {
        return data.tags.includes(selectedTag)
      })
      
      // update the selected tag text
      this.tagTitle.innerHTML = `"${selectedTag}"`
      

      // enable the clear button and add an active event listener when user clicks it
      this.clearButton.removeAttribute('disabled','');
      this.clearButton.addEventListener('click',this.handleClearButtonClick, true);

      // render the series list based on tag selection
      this.renderSeriesList(seriesList);
    };
    
  }

  
  /*
    seriesListClicked - function that is called when series list item is clicked
    event - an object that contains information on what type of event is triggered and also node information on where the event is triggered
  */
  seriesListClicked(event){
    let series = {}
    
    //check to see if it was a series that was clicked 
    if(event.target.className === 'series-name'){

      // if a series was selected based on an existing tag selection , remove the series information
      if(this.selectedSeriesItem !== ''){
        this.removeCurrentSelectedSeriesItem();
      }
      
      // get the unique id that identifies the series and convert to number data type
      const selectedSeriesId = Number(event.target.dataset.id);

      // store the current selected series object information and add active classname 
      this.selectedSeriesItem = event.target;
      event.target.classList.add('active');
      
      // get the selected series based on the id
      series = this.data.find(data => {
        return data.id === selectedSeriesId
      })

      // render series information
      this.renderSeries(series);
    }
  }

  /*
    clearButtonClicked - function that is called when clear button is clicked
  */
  clearButtonClicked(){
    const self = this;
    // remove existing animations 
    this.tagTitle.classList.remove('fadeIn');
    this.selectedSeriesDetail.classList.remove('fadeIn');
    
    // if tag is selected remove it
    if(this.selectedTagItem !== '') { 

      setTimeout(() => {
        self.removeCurrentSelectedTag();
        self.tagTitle.classList.add('fadeIn');
        self.tagTitle.innerHTML = this.noTagSelectedText;

      }, 1000)
    }

    // if series is selected remove it
    if(this.selectedSeriesItem !== '') {
      this.clearSeriesInfoWithTimeout()
    }

    // disable the clear button and remove the event handler
    this.clearButton.setAttribute('disabled','');
    this.clearButton.removeEventListener('click',this.handleClearButtonClick, true);

  }

  /*
    removeCurrentSelectedTag - removes the current selected tag class and clears it
  */
  removeCurrentSelectedTag(){
    this.selectedTagItem.classList.remove('active');
    this.selectedTagItem = '';
    this.seriesList.innerHTML = '';
  }

  /*
    clearSeriesInfoWithTimeout - method to call removing series list and series detail with specified timeout
    timeoutms - defaulto 1000 if no value is specified
  */

  clearSeriesInfoWithTimeout(timeoutms = 1000){
    const self = this;
    setTimeout(() => {
      self.removeCurrentSelectedSeriesItem();
      self.removeSeriesDetail();
    }, timeoutms)
  }

  /*
    removeCurrentSelectedSeriesItem - removes the current selected series class and clears it and updates the text
  */
  removeCurrentSelectedSeriesItem(){
    this.selectedSeriesItem.classList.remove('active');
    this.selectedSeriesItem = ''; 
  }

  removeSeriesDetail(){
    this.selectedSeriesDetail.classList.add('fadeIn');
    this.selectedSeriesDetail.innerHTML = this.noSeriesText 
  }

}


