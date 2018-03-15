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
    this.matchingItemsList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.selectedSeriesContent = this.config.element.querySelectorAll('.selected-item')[0];
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
  }

  getSeriesTagList() {
    let seriesTagList = [];
    for (let series of this.data) {
      for (let tag of series.tags) {
        if ($.inArray(tag, seriesTagList) === -1) {
          seriesTagList.push(tag)
        }
      }
    }
    return seriesTagList.sort();
  }

  getMatchingSeriesForTagName(tagName) {
    let matchingSeriesList = [];
    for (let series of this.data) {
      for (let tag of series.tags) {
        if (tag === tagName) {
          let matchingSeriesObj = {
            id: series.id,
            title: series.title
          }
          matchingSeriesList.push(matchingSeriesObj)
        }
      }
    }
    return matchingSeriesList;
  }

  getSelectedSeriesDataForId(id) {
    for (let series of this.data) {
      if (series.id === parseInt(id)) {
        return series;
      }
    }
  }

  getDefaultSeriesTemplate() {
    return `
      <div class="content">
        <h3 class="subtitle">No Series Selected</h3>
        <img src="http://via.placeholder.com/350x350" />
      </div>
      <ul class="meta-details">
        <li><strong>Rating:</strong> <span></span></li>
        <li><strong>Native Language Title:</strong> <span></span></li>
        <li><strong>Source Country:</strong> <span></span></li>
        <li><strong>Type:</strong> <span></span></li>
        <li><strong>Episodes:</strong> <span></span></li>
      </ul>
    `
  }

  getSelectedSeriesTemplate(selectedSeriesData) {
    return `
      <div class='content selected-series-content'>
        <h3 class='subtitle'>${selectedSeriesData.title}</h3>
        <img src='${selectedSeriesData.thumbnail}' />
        <p class="description">${selectedSeriesData.description}</p>
      </div>
      <ul class="meta-details">
        <li><strong>Rating:</strong> <span>${selectedSeriesData.rating}</span></li>
        <li><strong>Native Language Title:</strong> <span>${selectedSeriesData.nativeLanguageTitle}</span></li>
        <li><strong>Source Country:</strong> <span>${selectedSeriesData.sourceCountry}</span></li>
        <li><strong>Type:</strong> <span>${selectedSeriesData.type}</span></li>
        <li><strong>Episodes:</strong> <span>${selectedSeriesData.episodes}</span></li>
      </ul>
    `
  }

  getTagListItemTemplate(tagName) {
    return `
      <li><a href="#" class="tag-list-item" data-tag-name='${tagName}'><span class='tag is-link'>${tagName}</span></a></li>
    `
  }

  getMatchingItemListTemplate(matchingSeries) {
    return `
      <li><a href="#" class="matching-series-item" data-series-id='${matchingSeries.id}'>${matchingSeries.title}</a></li>
    `
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.matchingItemsList.addEventListener('click', this.matchingItemsListClicked.bind(this));
    this.clearButton.addEventListener('click', this.resetSeriesBrowser.bind(this));
  }

  render() {
    this.updateSeriesTagListNames();
    this.updateSelectedSeriesContent(this.getDefaultSeriesTemplate());
  }

  clearTagListItemState(listItems) {
    $(this.tagList).children("li").find("span").removeClass("active");
  }

  toggleTagListState(activeTagItem) {
    this.clearTagListItemState();
    $(activeTagItem).find("span").addClass("active");
  }

  toggleMatchingItemListState(target) {
    $(this.matchingItemsList).find(".matching-series-item").removeClass("active");
    $(target).addClass("active");
  }

  updateMatchingItemsListHeader(headerText) {
    $($(this.matchingItemsList).siblings(".subtitle")[0]).html(headerText);
  }

  updateMatchingItemsListContent(activeTagListName) {
    const matchingItemsSeriesList = this.getMatchingSeriesForTagName(activeTagListName);
    this.emptyMatchingItemsList();
    this.updateMatchingItemsListHeader("''" + activeTagListName + "''");
    for (let matchingSeries of matchingItemsSeriesList) {
      $(this.matchingItemsList).append(this.getMatchingItemListTemplate(matchingSeries));
    }
  }

  updateSeriesTagListNames() {
    let seriesTagListNames = this.getSeriesTagList();
    for (var tagName of seriesTagListNames) {
      $(this.tagList).append(this.getTagListItemTemplate(tagName));
    };
  }

  emptyMatchingItemsList() {
    $(this.matchingItemsList).empty();
  }

  tagListClicked(event) {
    event.preventDefault();
    const activeTagItem = $(event.target).parent("a");
    if (activeTagItem.length) {
      const activeTagListName = $(activeTagItem).attr("data-tag-name");
      $(this.clearButton).removeAttr('disabled');
      this.toggleTagListState(activeTagItem);
      this.updateMatchingItemsListContent(activeTagListName);
    }
  }

  updateSelectedSeriesContent(selectedSeriesTemplate) {
    $(this.selectedSeriesContent).empty().html(selectedSeriesTemplate);
  }

  matchingItemsListClicked(event) {
    event.preventDefault();
    const selectedSeriesId = $(event.target).attr("data-series-id");
    if (selectedSeriesId) {
      const selectedSeriesData = this.getSelectedSeriesDataForId(selectedSeriesId);
      this.toggleMatchingItemListState(event.target);
      this.updateSelectedSeriesContent(this.getSelectedSeriesTemplate(selectedSeriesData))
    }
  }

  resetSeriesBrowser() {
    const selectedTagTitle = "No Tag Selected";
    this.clearTagListItemState();
    this.updateSelectedSeriesContent(this.getDefaultSeriesTemplate());
    this.updateMatchingItemsListHeader(selectedTagTitle);
    this.emptyMatchingItemsList();
    $(this.clearButton).attr('disabled', 'disabled');
  }
}
