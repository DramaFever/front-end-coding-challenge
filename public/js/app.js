export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.initState.bind(this))
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
    console.log('Data fetched');
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.tagListHeader = this.config.element.querySelectorAll('.subtitle')[1];
    this.seriesListHeader = this.config.element.querySelectorAll('.subtitle')[2];
    this.seriesList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.seriesContent = this.config.element.querySelectorAll('.selected-item')[0];
    this.seriesSubDetails = this.config.element.querySelectorAll('ul')[2].querySelectorAll('span');
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0]; 
    //find and store other elements you need
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.seriesList.addEventListener('click', this.seriesListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this)); 

    //bind the additional event listener for clicking on a series title
  }

  initState(){
    this.tagListHeader.innerHTML = 'No Tag Selected';
    this.seriesListHeader.innerHTML = 'No Series Selected';
    this.clearButton.setAttribute('disabled', "");  
    //set initial state for headers and clear button
  }


  render() {
    const tags = this.data.map(series => series.tags); 
    const flatTags = tags.reduce((arr, tag) => arr.concat(tag), []);
    let uniqueTags = Array.from(new Set(flatTags)); 
        uniqueTags = uniqueTags.sort();
        for(let tag of uniqueTags){
          let li = document.createElement("li");
              li.className = "tag is-link"; 
              li.textContent = tag; 
              this.tagList.append(li);  
        }
    console.log("This Page Renders", this);
    //render the list of tags from this.data into this.tagList
  }

  updateActiveClass(list, evt, style){
    let currentActive = list.querySelector('.active');
    if(currentActive !== null) currentActive.classList.remove('active'); 
    evt.target.className = style; 
    //update active css class 
  }

  resetSeriesContent(){
    this.seriesContent.querySelector('img').src = '';
    this.seriesContent.querySelector('p').innerHTML = '';
    this.seriesContent.querySelector('.subtitle').innerHTML = 'No Series Selected';
    for(let details of this.seriesSubDetails){
      details.innerText = " "; 
    }
     //reset series content data
  }

  tagListClicked(event) {
    let selectedTag = event.target.innerHTML; 
    const seriesArr = this.data.filter(item => item.tags.includes(selectedTag));  
    
    this.resetSeriesContent();
    this.clearButton.removeAttribute('disabled');
    this.tagListHeader.innerHTML = '"'+ selectedTag + '"';
    this.seriesList.innerHTML = " "; 
    this.updateActiveClass(this.tagList, event, 'tag is-link active');

    for(let series of seriesArr) {
      let li = document.createElement("li");
          li.setAttribute('data-id', series.id); 
          li.textContent = series.title; 
          this.seriesList.append(li);
    }
    console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }



  seriesListClicked(event) {
    //find selected id
    let selectedId = parseInt(event.target.dataset.id);
     //find series elements
    let subtitle = this.seriesContent.querySelector('.subtitle'); 
    let thumbnail = this.seriesContent.querySelector('img');
    let description = this.seriesContent.querySelector('p');
    let contentInfo = this.seriesSubDetails;

    //update active class
    this.updateActiveClass(this.seriesList, event, 'active');

    //add series data to DOM
    for(let series of this.data){
      if(series.id === selectedId){
        thumbnail.src = series.thumbnail;
        subtitle.innerHTML = series.title; 
        description.innerHTML = series.description; 
        contentInfo[0].innerText = series.rating;
        contentInfo[1].innerText = series.nativeLanguageTitle; 
        contentInfo[2].innerText = series.sourceCountry; 
        contentInfo[3].innerText = series.type;
        contentInfo[4].innerText = series.episodes;
      }
    } 
      console.log("Series Clicked", event);
    //check to see if series was clicked and render 

  }

  
  clearButtonClicked(event) {
    this.tagListHeader.innerHTML = 'No Tag Selected';
    this.seriesList.innerText = ''; 
    this.resetSeriesContent()
    this.clearButton.setAttribute('disabled', ''); 
    let currentActive = this.tagList.querySelector('.active');
    if(currentActive !== null) currentActive.classList.remove('active');  

    //reset widget
  }
}


