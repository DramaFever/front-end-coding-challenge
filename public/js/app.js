export default class TagBrowserWidget {
  /////////////////////////////////////////////////////////////////////////////
  ///////////////////          DATA AND ELEMENTS            ///////////////////
  /////////////////////////////////////////////////////////////////////////////
  constructor(config) {
    this.config = config;

    fetch('/js/data.json')
      .then((response) => response.json())
      // use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.renderTagList.bind(this));

    console.log('Widget Instance Created');
  }

  setData(data) {
    this.data = data;
    console.log('Data fetched', this.data);
    this.tags = Array.from(new Set(
      data.reduce((allTags, item) => allTags.concat(item['tags']), []).sort()
    ))
  }

  getElements() {
    this.tagList = this.config.element.querySelector('.tag-list')
    // find and store other elements you need
    this.seriesContent = this.config.element.querySelector('#series-list-content')
    this.seriesListTitle = this.seriesContent.getElementsByTagName('h3')[0]
    this.seriesList = this.config.element.querySelector('.series-list')
    this.bookContent = this.config.element.querySelector('#book-content')
    this.clearButton = this.config.element.querySelector('.clear-button')
    this.noSelection = '.no-selection'
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    // bind the additional event listener for clicking on a series title
    this.seriesList.addEventListener('click', this.seriesListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearAll.bind(this));
  }

  /////////////////////////////////////////////////////////////////////////////
  ///////////////////              RENDERING                ///////////////////
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Display Tag List
   */
  renderTagList() {
    // render the list of tags from this.data into this.tagList
    this.tags.forEach(tag => {
      this.tagList.appendChild(this.__listItemTemplate.call(this, tag, tag, 'tag', 'is-link is-medium'));
    })
  }

  /**
   * Display Series List
   */
  renderSeriesList() {
    this.seriesContent.querySelector(this.noSelection).classList.add('hide')
    if (!this.bookContent.querySelector(this.noSelection).classList.contains('no-more-show')) {
      this.bookContent.querySelector(this.noSelection).classList.replace('hide', 'show')
    }

    this.seriesForTag.forEach(series => {
      this.seriesList.appendChild(this.__listItemTemplate.call(this, series.title, series.id, 'series', 'tag is-primary is-medium'));
    });
  }

  /**
   * Display Book
   */
  renderBook() {
    const bookItem = document.createElement('div'),
          curentBookItem = document.querySelector('[data-book-item="' + this.currentBook.id + '"]')

    // setup book
    bookItem.setAttribute('class', 'book-item hide')
    bookItem.setAttribute('data-book-item', this.currentBook.id)
    bookItem.innerHTML = this.__bookTemplate.call(this, this.currentBook)

    ///// CREATE EACH BOOK ONE TIME AND SHOW/HIDE CREATED BOOKS /////
    ///// CACHE AND PREVENT FLICKER ON LOAD WHEN PREVIOUS BOOKS ARE VIEWED /////

    // create book if not found
    if (!curentBookItem) {
      this.bookContent.appendChild(bookItem)
    }

    // search through all created books
    document.querySelectorAll('[data-book-item]').forEach(book => {
      // hide all books
      book.classList.replace('show', 'hide')

      // show current book
      document.querySelector('[data-book-item="' + this.currentBook.id + '"]').classList.replace('hide', 'show')
    })

    /////
  }


  /////////////////////////////////////////////////////////////////////////////
  ///////////////////              INTERACTIVE              ///////////////////
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Tag List Clicked
   */
  tagListClicked(event) {
    console.log('tag list (or child) clicked', event);
    // check to see if it was a tag that was clicked and render
    if (!event.target.getAttribute('data-tag')) return;
    // the list of series that have the matching tags
    this.__setCurrentTag(event.target.getAttribute('data-tag'));
    // enable the clear button
    this.clearButton.disabled = false
  }

  /**
   * Series List Clicked
   */
  seriesListClicked(event) {
    console.log('series list (or child) clicked', event);
    // check to see if it was a series that was clicked and render
    if (!event.target.getAttribute('data-series')) return;
    // the list of series that have the matching seriess
    this.__setCurrentSeries(event.target.getAttribute('data-series'));
  }

  /**
   * Clear Active Data
   */
  clearAll() {
    this.__clearTags.call(this)
    this.__clearSeries.call(this)
    this.__clearBooks.call(this)
    // disable the clear button
    this.clearButton.disabled = true
  }

  /////////////////////////////////////////////////////////////////////////////
  ///////////////////               TEMPLATES               ///////////////////
  /////////////////////////////////////////////////////////////////////////////

  /**
   * List Item Template
   */
  __listItemTemplate(name, id, type, tagclass) {
    const listItem = document.createElement('li'),
          listItemSpan = document.createElement('span')

    // create list item
    listItemSpan.setAttribute('class', type + ' ' + tagclass)
    listItemSpan.setAttribute('data-' + type, id);
    listItemSpan.innerHTML = name;

    // build list
    listItem.appendChild(listItemSpan)

    return listItem;
  }

  /**
   * Book Template
   */
  __bookTemplate(book) {
    return `
      <div class="content">
        ${book.title ? '<h3 class="subtitle">' + book.title + '</h3>' : ''}
      </div>
      <div class="columns">
        <div class="column is-half">
          ${book.image ? '<img src="' + book.image + '" />' : ''}
        </div>
        <div class="column is-half">
          ${book.description ? '<p>' + book.description + '</p>' : ''}
          <hr>
          <table class="book-info table is-striped is-hoverable is-fullwidth">
            ${book.pages ? '<tr><th>Pages:</th><td>' + book.pages + '</td></tr>' : ''}
            ${book.release_date ? '<tr><th>Release Date:</th><td>' + book.release_date + '</td></tr>' : ''}
            ${book.authors ? '<tr><th>Authors:</th><td>' + book.authors.join(', ') + '</td></tr>' : ''}
            ${book.issue_number ? '<tr><th>Issue Number:</th><td>' + book.issue_number + '</td></tr>' : ''}
            ${book.age_rating ? '<tr><th>Age Range:</th><td>' + book.age_rating + '</td></tr>' : ''}
            ${book.series_title ? '<tr><th>Series Title:</th><td>' + book.series_title + '</td></tr>' : ''}
          </table>
        </div>
      </div>
    `
  }


  /////////////////////////////////////////////////////////////////////////////
  ///////////////////               COMPONENTS              ///////////////////
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Set Current Tag
   */
  __setCurrentTag(tag) {
    this.currentTag = tag

    const allTags = document.querySelectorAll('[data-tag]'),
          currentTag = document.querySelector('[data-tag="' + tag + '"]')

    allTags.forEach(item => {
      // clear all previous active tags
      item.classList.remove('active')
      // current tag active
      currentTag.classList.add('active');
      // current tag title
      this.seriesListTitle.innerHTML = tag
    })

    // set the series info for the selected tag
    this.__setSeriesForCurrentTag.call(this);
    // hide the books for the previous series
    this.__clearBooks.call(this)
  }

  /**
   * Set Current Series
   */
  __setCurrentSeries(series) {
    // select the curren book
    this.currentBook = this.data.find(s => s.id === series);
    // show/hide pre-selection message
    this.bookContent.querySelector(this.noSelection).classList.replace('show', 'hide')
    this.bookContent.querySelector(this.noSelection).classList.add('no-more-show')

    const allSeries = document.querySelectorAll('[data-series]'),
          currentSeries = document.querySelector('[data-series="' + series + '"]')

    allSeries.forEach(item => {
      // clear all previous active seriess
      item.classList.remove('active')
      // current series active
      currentSeries.classList.add('active');
    })

    // build the book
    this.renderBook.call(this, series);
  }

  /**
   * Set Series for Current Tag
   */
  __setSeriesForCurrentTag() {
    // wipe the current series list
    this.seriesList.innerHTML = ''

    // map current tag and data to build series list
    this.seriesForTag = this.data.filter(series => {
      return series.tags.map(tag => tag).includes(this.currentTag);
    });

    // build the series list for the current tag
    this.renderSeriesList.call(this);
  }

  /**
   * Clear Active Tags
   */
  __clearTags() {
    // Reset Tag List
    this.tagList.querySelectorAll('li').forEach(tagItem => {
      tagItem.querySelector('span').classList.remove('active')
    })
  }

  /**
   * Clear Series Data
   */
  __clearSeries() {
    // Reset Series Data
    this.seriesListTitle.innerHTML = 'No Tag Selected'
    this.seriesList.innerHTML = ''
    this.seriesContent.querySelector(this.noSelection).classList.remove('hide')
  }

  /**
   * Clear Books
   */
  __clearBooks() {
    // Reset Book Content
    this.bookContent.querySelector(this.noSelection).classList.replace('no-more-show', 'show')
    this.bookContent.querySelectorAll('[data-book-item]').forEach(book => {
      book.classList.replace('show', 'hide')
    })
  }
}
