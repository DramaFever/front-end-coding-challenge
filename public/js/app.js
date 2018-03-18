export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.selectedTag = null;
    this.selectedSeries = null;

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

    //find and store other elements you need
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
    this.matchingItemsList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.selectedTag = this.config.element.querySelectorAll('.subtitle')[1];
    this.selectedSeries = this.config.element.querySelectorAll('.subtitle')[2];
    this.contentArea = this.config.element.querySelectorAll('.content')[2];
    this.seriesInfoList = this.config.element.querySelectorAll('ul')[2];
    this.thumbnail = this.config.element.querySelectorAll('img')[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this));
    this.matchingItemsList.addEventListener('click', this.matchingItemsListClicked.bind(this));
  }

  render() {
    this.clearSelectedTag();
    $(this.tagList).empty();
    $(this.matchingItemsList).empty();
    this.clearContentArea();
    this.populateTags();
    this.enableDisableClearButton();
  }

  clearContentArea() {
    $(this.selectedSeries).text('No Series Selected');
    $(this.thumbnail).attr('src', 'http://via.placeholder.com/350x350');
    $(this.seriesInfoList).find('span').remove();
    $(this.contentArea).find('p')[0].innerText = '';
  }

  clearSelectedTag() {
    this.setSelectedTag(null);
    $(this.tagList).find('li span').removeClass('active');
    $(this.selectedTag).text('No Tag Selected');
  }

  populateTags() {
    // Collect all the tags
    const tagsArray = this.data.reduce((prev, cur) => {
      return prev.concat(cur.tags);
    }, []);
    // Sort the list and return only the unique ones. This will sort in pure alphabetic order. i.e. Staff favorites
    // will not appear first
    const uniqTags = [
      ...new Set(tagsArray.sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      })
    )];

    //render the list of tags from this.data into this.tagList
    uniqTags.forEach((t) => {
      $(this.tagList).append(`<li><span class="tag is-link">${t}</span></li>`);
    });
  }

  clearButtonClicked(event) {
    console.log('clear button clicked', event);
    $(this.matchingItemsList).empty();
    this.clearContentArea();
    this.clearSelectedTag();
  }

  setSelectedTag(tag) {
    this.selectedTagObj = tag;
    this.enableDisableClearButton();
  }

  setSelectedSeries(series) {
    this.selectedSeriesObj = series;
    this.enableDisableClearButton();
  }

  enableDisableClearButton() {
    if (this.selectedTagObj && this.selectedSeriesObj) {
      $(this.clearButton).removeAttr('disabled');
    } else {
      $(this.clearButton).attr('disabled', true);
    }
  }

  matchingItemsListClicked(event) {
    console.log('matching item list clicked', event);
    if (event.target) {
      this.clearContentArea();

      const clickedSeries = $(this.matchingItemsList).find(event.target)[0];
      const clickedId = $(clickedSeries).data('id');
      
      // Highlight clicked series, remove highlight from others
      $(this.matchingItemsList).find('li').removeClass('active');
      $(clickedSeries).addClass('active');
      
      // Retrieve selected series from data
      const seriesData = this.data.find((item) => {
        return item.id === clickedId;
      });

      this.setSelectedSeries(seriesData);

      // Populate data
      $(this.selectedSeries).text(seriesData.title);
      $(this.contentArea).find('p')[0].innerText = seriesData.description;
      $(this.thumbnail).attr('src', seriesData.thumbnail);
      $(this.seriesInfoList).find('li').each((ind, item) => {
        switch(item.innerText) {
          case 'Rating:':
            $(item).append(`<span>${seriesData.rating}</span>`);
            break;
          case 'Native Language Title:':
            $(item).append(`<span>${seriesData.nativeLanguageTitle}</span>`);
            break;
          case 'Source Country:':
            $(item).append(`<span>${seriesData.sourceCountry}</span>`);
            break;
          case 'Type:':
            $(item).append(`<span>${seriesData.type}</span>`);
            break;
          case 'Episodes:':
            $(item).append(`<span>${seriesData.episodes}</span>`);
            break;
          default:
            break;
        }
      });
    }
  }

  tagListClicked(event) {
    console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    // Make sure a list item was clicked, not the list itself and highlight the tag.
    if (event.target && $(event.target).children().length === 0) {
      const tagText = $(this.tagList).find(event.target)[0].innerText;
      $(this.matchingItemsList).empty();
      this.clearContentArea();

      $(this.selectedTag).text(tagText);
      this.setSelectedTag(tagText);
      $(this.tagList).find('li span').removeClass('active');
      $(this.tagList).find(event.target).addClass('active');

      // Now find matching titles for the clicked tag and render the title list
      const matchedItems = this.data.filter((item) => {
        if (item && item.tags.includes(tagText)) return item;
      });

      matchedItems.forEach((item) => {
        $(this.matchingItemsList).append(`<li data-id=${item.id}>${item.title}</li>`);
      });
    }
  }
}
