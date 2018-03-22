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
    this.data = this.mapTagsToSeries(data)
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.seriesList = this.config.element.querySelectorAll('.matching-items-list')[0]
    this.seriesListSubtitle = this.seriesList.previousElementSibling
    this.selectedItem = this.config.element.querySelectorAll('.selected-item')[0]
    this.selectedItemSubtitle = this.selectedItem.querySelectorAll('.subtitle')[0]
    this.selectedItemImage = this.selectedItem.querySelectorAll('img')[0]
    this.selectedItemDesc = this.selectedItem.querySelectorAll('p')[0]
    this.selectedItemMeta = this.selectedItem.querySelectorAll('ul')[0].children
    this.clearDisplayBtn = this.config.element.querySelectorAll('.clear-button')[0]
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.seriesList.addEventListener('click', this.seriesListClicked.bind(this))
    this.clearDisplayBtn.addEventListener('click', this.clearAllClicked.bind(this))
  }

  render() {
    this.displayTagList()
  }

  toggleActive(event, collection) {
    Array.from(collection.children).forEach((listElement)=>{
      let currentTag = listElement.querySelectorAll('span')[0]
      if(event.target.id === currentTag.id) {
        this.clearDisplayBtn.classList.remove('disabled')
        if (!currentTag.classList.contains('active')) currentTag.classList.add('active');
      } else {
        if (currentTag.classList.contains('active')) currentTag.classList.remove('active');
      }
    })
  }

  tagListClicked(event) {
    $(this.seriesList).fadeOut(250).delay().fadeIn(200)
    setTimeout(()=>{
      this.clearSelection()
      this.toggleActive(event, this.tagList);
      this.populateSeriesList(event);
    },250)

  }

  seriesListClicked(event) {
    this.toggleActive(event, this.seriesList)
    this.displaySingleSeries(event)
  }

  clearAllClicked(event) {
    if (!this.clearDisplayBtn.classList.contains('disabled')) {
      $(this.config.element).fadeOut(400)
      setTimeout(()=>{
        this.clearAll()
      },400)
      $(this.config.element).fadeIn(400)
    }
  }

  populateSeriesList(event) {
    const tagText = event.target.innerText;
    this.seriesListSubtitle.innerText = tagText;
    this.clearSeriesList(tagText);
    this.displaySeriesList(tagText)
  }

  displayTagList() {
    this.clearAll();
    Array.from(this.data.keys()).forEach((tag) =>{
      $(this.buildListItem(tag, true)).hide()
        .appendTo(this.tagList)
        .animate({width:'toggle'},400)
    })
  }

  displaySeriesList(tagText) {
    Array.from(this.data.get(tagText)).forEach((series) =>{
      this.seriesList.setAttribute('data-parent', `${tagText}`)
      $(this.buildListItem(series.title, false, series.id)).hide()
        .appendTo(this.seriesList)
        .animate({width:'toggle'},400)
    })
  }

  displaySingleSeries(event) {
    $(this.selectedItem).slideUp( 300 ).delay( 300 ).fadeIn( 400 )
    setTimeout(() => {
      const seriesItem = this.getSeriesItem(event);
      this.selectedItemSubtitle.innerText = seriesItem.title;
      this.selectedItemImage.src = seriesItem.thumbnail;
      this.selectedItemDesc.innerText = seriesItem.description;
      this.config.element.querySelectorAll('#rating')[0].innerText= seriesItem.rating;
      this.config.element.querySelectorAll('#native-language-title')[0].innerText = seriesItem.nativeLanguageTitle;
      this.config.element.querySelectorAll('#country')[0].innerText = seriesItem.sourceCountry;
      this.config.element.querySelectorAll('#type')[0].innerText = seriesItem.type;
      this.config.element.querySelectorAll('#episodes')[0].innerText = seriesItem.episodes;
    }, 600);

  }

  getSeriesItem(event) {
    const parentTagElement = this.config.element.querySelectorAll('.matching-items-list')[0];
    const parentTag = parentTagElement.dataset.parent;
    const parentSeries = Array.from(this.data.get(parentTag));
    for(let i = 0; i < parentSeries.length; i++ ){
      if (parentSeries[i].id == event.target.id) {
        return parentSeries[i];
      }
    }
  }

  buildListItem(text, isTag, id) {
    const tagE = document.createElement('li')
    let content = isTag ? `<span id="${text}" class="tag is-link">${text}</span>` : `<span id="${id}">${text}</span>`
    tagE.innerHTML = content
    return tagE
  }

  mapTagsToSeries(data) {
    let mapping = new Map();
    data.forEach((series) => {
      series.tags.forEach((tag)=> {
        if (mapping.has(tag)) {
          mapping.set(tag, [...mapping.get(tag), series])
        } else {
          mapping.set(tag, [series])
        }
      })
    })
    return mapping = new Map([...mapping.entries()].sort());
  }

  clearAll() {
    this.clearSeriesList();
    this.clearSeriesSubtitle();
    this.clearSelection();
    this.removeActiveTag();
    this.clearDisplayBtn.classList.add('disabled')
  }

  removeActiveTag(){
    Array.from(this.tagList.children).forEach((listElement)=>{
      let currentTag = listElement.querySelectorAll('span')[0]
      if (currentTag.classList.contains('active')) currentTag.classList.remove('active');
    })
  }

  clearSeriesList() {
    this.seriesList.innerHTML = ''
  }

  clearSeriesSubtitle() {
    this.seriesListSubtitle.innerText = 'No Tag Selected'
  }

  clearSelection() {
    this.selectedItemSubtitle.innerText = 'No Series Selected';
    this.selectedItemImage.src = "http://via.placeholder.com/350x350";
    this.selectedItemDesc.innerText = '';
    this.clearSelectionMeta();
  }

  clearSelectionMeta() {
    Array.from(this.selectedItemMeta).forEach((element) => {
      element.querySelectorAll('span')[0].innerText = ''
    })
  }

}
