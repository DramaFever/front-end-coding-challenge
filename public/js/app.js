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
    this.tagMap = this.buildTagMap(data);
    console.log('Tag Map', this.tagMap);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    
    //find and store other elements you need
    this.matchingItems = $('.matching-items-list');
    this.selectedItem = $('.selected-item');
    this.tagSubtitle = $('.tag-sub');
    this.clearButton = $('.clear-button');
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
    this.matchingItems.on('click', this.matchListClicked.bind(this));
    this.clearButton.on('click', this.resetView.bind(this));
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.resetView();
    $(this.tagList).html(this.buildTagList(Object.keys(this.tagMap)));
  }

  tagListClicked(event) {   
    console.log('tag list (or child) clicked', event);

    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    event.preventDefault();
    if($(event.target).parent().hasClass('active')) return;  
    const _key = $(event.target).data('key');
    this.tagSubtitle.html(`"${_key.split('_').join(' ')}"`);
    this.matchingItems.html(this.buildMatchList(this.filterShows(_key)));
    this.clearButton.removeClass('disabled');
    $(this.tagList).find('li').removeClass('active');
    $(event.target).parent().addClass('active');
  }

  buildTagMap(shows) {
    const _tagMap = {};
    for(let show of shows){
      for(let tag of show.tags){
        const _tag = tag.split(' ').join('_');
        if(_tagMap[_tag]) _tagMap[_tag].push(show.id);
        else _tagMap[_tag] = [show.id];
      }
    }
    return _tagMap;
  }

  filterShows(tag) {
    return this.data.filter(show => this.tagMap[tag].includes(show.id));
  }

  buildTagList(items) {
    return items.sort().map(item => {
      const _title = item.split('_').join(' ');
      return (
        `<li>
          <a href="#" data-key="${item}" title="${_title}">${_title}</a>
        </li>`
      );
    }).join('');
  }

  buildMatchList(items) {
    return items.map(item => {
      return (
        `<li>
          <a href="#" data-id="${item.id}" title="${item.title}">${item.title}</a>
        </li>`
      );
    }).join('');
  }

  matchListClicked(event) {
    event.preventDefault();
    if($(event.target).hasClass('active')) return;
    const _id = $(event.target).data('id');
    const _series = this.data.filter(show => show.id === _id);
    this.selectedItem.html(this.buildSeries(_series));
    this.matchingItems.find('a').removeClass('active');
    $(event.target).addClass('active');
  }

  buildSeries(series) {
    return (
      `<div class="content series">
        <h3 class="subtitle">${series[0].title}</h3>
        <img src="${series[0].thumbnail}" title="${series[0].title}" alt="${series[0].title}" />
        <p>${series[0].description}</p>
        <ul>
          <li><strong>Rating:</strong> <span>${series[0].rating}</span></li>
          <li><strong>Native Language Title:</strong> <span>${series[0].nativeLanguageTitle}</span></li>
          <li><strong>Source Country:</strong> <span>${series[0].sourceCountry}</span></li>
          <li><strong>Type:</strong> <span>${series[0].type}</span></li>
          <li><strong>Episodes:</strong> <span>${series[0].episodes}</span></li>
        </ul>
      </div>`
    )
  }

  get emptySeries(){
    return (
      `<div class="content">
        <h3 class="subtitle">No Series Selected</h3>
        <img src="http://via.placeholder.com/350x350" />
        <ul>
          <li><strong>Rating:</strong></li>
          <li><strong>Native Language Title:</strong></li>
          <li><strong>Source Country:</strong></li>
          <li><strong>Type:</strong></li>
          <li><strong>Episodes:</strong></li>
        </ul>
      </div>`
    )
  }

  resetView(event = null) {
    if(event) {
      event.preventDefault();
      if($(event.target).hasClass('disabled')) return;
    }
    this.matchingItems.html('');
    this.tagSubtitle.html('No Tag Selected');
    this.selectedItem.html(this.emptySeries);
    this.clearButton.addClass('disabled');
    $(this.tagList).find('li').removeClass('active');
  }
}
