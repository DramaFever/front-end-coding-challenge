export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this));

    // create an alias for the clearButtonClickHandler that is bound to this,
    // so that we have the ability to remove the event handler from the clear
    // button after it has been added
    this.boundClearButtonClickHandler = this.clearButtonClickHandler.bind(this);

    console.log('Widget Instance Created');
  }

  bindEventListeners() {

    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
    this.matchingItemsList.addEventListener('click', this.matchingItemListClicked.bind(this));

  }

  clearButtonClickHandler(event) {

    // clear the details of any selected matching items
    this.clearDetailArea();

    // clear the matching items list
    this.matchingItemsList.innerHTML = '';

    // reset the title of the matching items list
    this.matchingItemsListSubtitle.innerHTML = 'No Tag Selected';

    this.clearCategorySelection();

    // disable the clear button
    $(this.clearButton).attr('disabled', true);
    this.clearButton.removeEventListener('click', this.boundClearButtonClickHandler);

  }

  clearCategorySelection() {

    // remove the styling on the category that was active
    this.selectedCategoryItemSpan.classList.remove('active');

    // remove the reference to category item node that was selected
    delete this.selectedCategoryItemSpan;

  }

  clearDetailArea() {

    // reset the selected matching item details area
    this.selectedItemDetails.innerHTML = '<div class="content"><h3 class="subtitle">No Series Selected</h3></div>';
  }

  clearMatchingItemSelection() {

    // remove the active styling from the selected matching item
    this.selectedMatchingItem.classList.remove('active');

    // reset the property that holds a reference to the selected matching item element
    delete this.selectedMatchingItem;

  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  getElements() {

    this.tagList = this.config.element.querySelector('.tag-list');
    
    //find and store other elements you need
    
    this.matchingItemsList = this.config.element.querySelector('.matching-items-list');
    this.matchingItemsListSubtitle = this.config.element.querySelector('.column.content .subtitle');
    
    this.selectedItemDetails = this.config.element.querySelector('.selected-item');

    this.clearButton = this.config.element.querySelector('.clear-button');

  }

  getTags() {

    // parses the tags out of the master data set and returns then in an Array

    return Array.from(this.data.reduce(function(tagSet, assetDataObject) {

      // NOTE: the accumulator of this reduce function is a Set in order to filter out duplicate values

      assetDataObject.tags.forEach(function(value) {
        tagSet.add(value);
      });

      return tagSet;

    }, new Set()));

  }

  matchingItemListClicked(event) {

    console.log('matching item clicked', event);

    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags

    let target = event.target;

    if (target.localName === 'li') {

      // clear previous selection
      if (this.selectedMatchingItem) {
        this.clearMatchingItemSelection();
      }

      // add selected styling to the node that was clicked
      target.classList.add('active');
      // save a reference to the selected matching item so that it can be easily deselected at a later time
      this.selectedMatchingItem = target;

      let selectedSeriesID = target.dataset.id;
      
      this.renderSelectedSeriesDetails(selectedSeriesID);

    }

  }

  render() {

    //render the list of tags from this.data into this.tagList

    let tags = this.getTags().sort();

    this.initTagNodesHTML = tags.reduce(function(htmlText, tagText) {
      
      htmlText += `<li><span class="tag is-link">${tagText}</span></li>`;

      return htmlText;

    }, '');

    this.tagList.innerHTML = this.initTagNodesHTML;

  }

  renderMatchingItems() {

    let matchingItemsHTML = this.matchingItems.reduce(function(htmlText, matchingItemDataObject) {
      
      htmlText += `<li data-id="${matchingItemDataObject.id}">${matchingItemDataObject.title}</li>`;

      return htmlText;

    }, '');

    this.matchingItemsList.innerHTML = matchingItemsHTML;

  }

  renderSelectedSeriesDetails(selectedSeriesID) {

    // render the details for the selected matching item
    
    selectedSeriesID = Number(selectedSeriesID);

    // get the data for the asset using the unique ID
    let selectedItemDataObject = this.matchingItems.filter(function(matchingItemDataObject) {
      return matchingItemDataObject.id === selectedSeriesID;
    })[0];

    let selectedItemDetailsHTML = 
      `<div class="content">
        <h3 class="subtitle">${selectedItemDataObject.title}</h3>
        <img src="${selectedItemDataObject.thumbnail}" />
        <p>
        ${selectedItemDataObject.description}
        </p>
      </div>
      <ul>
        <li><strong>Rating:</strong> <span>${selectedItemDataObject.rating}</span></li>
        <li><strong>Native Language Title:</strong> <span>${selectedItemDataObject.nativeLanguageTitle}</span></li>
        <li><strong>Source Country:</strong> <span>${selectedItemDataObject.sourceCountry}</span></li>
        <li><strong>Type:</strong> <span>${selectedItemDataObject.type}</span></li>
        <li><strong>Episodes:</strong> <span>${selectedItemDataObject.episodes}</span></li>
      </ul>`;

    this.selectedItemDetails.innerHTML = selectedItemDetailsHTML;

  }

  setData(data) {
    this.data = data;
    console.log('Data fetched', this.data);
  }

  tagListClicked(event) {

    console.log('tag list (or child) clicked', event);

    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags

    if ((event.target.localName === 'li') || (event.target.parentNode.localName === 'li')) {

      // if another category has been previously selected...
      if (this.selectedCategoryItemSpan) {

        // ...then clear that selection
        this.clearCategorySelection();

        // if there are details showing...
        if (this.selectedMatchingItem) {

          // ...then clear the details and the reference to the selected matching item
          this.clearDetailArea();
          delete this.selectedMatchingItem;

        }
        
      }

      let selectedListItem = (event.target.localName === 'li') ? event.target : event.target.parentNode;
      let selectedListItemSpan = selectedListItem.childNodes[0];
      let selectedCategory = selectedListItemSpan.childNodes[0].data;
      
      // highlight the selected category
      selectedListItemSpan.classList.add('active');

      this.selectedCategoryItemSpan = selectedListItemSpan;

      $(this.clearButton).attr('disabled', false);
      this.clearButton.addEventListener('click', this.boundClearButtonClickHandler);

      // update the subtitle above the matching items display area
      this.matchingItemsListSubtitle.innerHTML = `"${selectedCategory}"`;
      
      this.matchingItems = this.data.filter(function(assetDataObject, index, array) {

        return assetDataObject.tags.includes(selectedCategory);

      });

      this.renderMatchingItems();

    }

  }
}
