'use strict';

const SELECTED_NAMES = Object.freeze({
  SERIES: 'series',
  TAG: 'tag'
});
const DEFAULT_VALUES = Object.freeze({
  MATCHING_ITEMS_TITLE: 'No Tag Selected',
  SELECTED_ITEM: {
    thumbnail: 'http://via.placeholder.com/350x350',
    title: 'No Series Selected'
  }
});

// https://developers.google.com/web/updates/2015/01/ES6-Template-Strings
const UTIL_VALUES = Object.freeze({
  reEscape: /[&<>'"]/g,
  oEscape: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }
});

class util {
  fnEscape(m) {
    return UTIL_VALUES.oEscape[m];
  }

  escape(s) {
    const isDefined = typeof s !== 'undefined';

    return String.prototype.replace.call(
      isDefined ? s : '',
      UTIL_VALUES.reEscape,
      this.fnEscape
    );
  }
}

class Template {
  constructor() {
    this.util = new util();
  }

  html(pieces) {
    let result = pieces[0];
    let substitutions = [].slice.call(arguments, 1);

    for (let i = 0; i < substitutions.length; i += 1) {
      result += this.util.escape(substitutions[i]) + pieces[i + 1];
    }
    return result;
  }
}

class TagBrowserView {
  constructor() {
    this.Template = new Template();
  }

  matchingItem(data) {
    let item = data.item;

    return this.Template.html`
      <li class="is-link tag-browser-matching-item tag-browser__i18n" data-item="${item.id}">
        ${item.title}
      </li>
    `;
  }

  matchingItemsTitle(data) {
    const hasSelectedTag = typeof data.tag !== 'undefined';

    return hasSelectedTag ?
      this.Template.html`&ldquo;${data.tag}&rdquo;` :
      this.Template.html`${DEFAULT_VALUES.MATCHING_ITEMS_TITLE}`;
  }

  selectedItem(data) {
    let item = data.item;
    const noSelectedItem = typeof item === 'undefined';

    if (noSelectedItem) {
      item = DEFAULT_VALUES.SELECTED_ITEM;
    }
    return this.Template.html`
      <div class="content">
        <h3 class="subtitle tag-browser-series__selected tag-browser__i18n">${item.title}</h3>
        <img alt="${item.title}" src="${item.thumbnail}" title="${item.title}" />
        <p class="tag-browser__i18n">
          ${item.description}
        </p>
      </div>
      <ul>
        <li><strong>Rating:</strong> <span class="tag-browser__i18n">${item.rating}</span></li>
        <li><strong>Native Language Title:</strong> <span class="tag-browser__i18n">${item.nativeLanguageTitle}</span></li>
        <li><strong>Source Country:</strong> <span class="tag-browser__i18n">${item.sourceCountry}</span></li>
        <li><strong>Type:</strong> <span class="tag-browser__i18n">${item.type}</span></li>
        <li><strong>Episodes:</strong> <span class="tag-browser__i18n">${item.episodes}</span></li>
      </ul>
    `;
  }

  tag(data) {
    return this.Template.html`
      <li>
        <span data-item="${data.tag}" class="tag is-link tag-browser__i18n">
          ${data.tag}
        </span>
      </li>
    `;
  }
}

export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.TagBrowserView = new TagBrowserView();

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

  initData() {
    this.data = {};
    this.tags = {};
  }

  setData(data) {
    let id;
    let saveTag = (tag) => {
      if (typeof this.tags[tag] === 'undefined') {
        this.tags[tag] = {};
      }
      this.tags[tag][id] = true;
    };
    let saveItem = (item) => {
      id = item.id;
      this.data[id] = item;
      item.tags.forEach(saveTag);
    };
  
    this.initData();
    data.forEach(saveItem);
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
    this.matchingItemsTitle = this.config.element.querySelectorAll('.tag-browser-matching-items__selected')[0];
    this.selectedItem = this.config.element.querySelectorAll('.selected-item')[0];
    this.list = {
      series: this.config.element.querySelectorAll('.matching-items-list')[0],
      tag: this.config.element.querySelectorAll('.tag-list')[0]
    }

    //find and store other elements you need
  }

  bindEventListeners() {

    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    this.list[SELECTED_NAMES.TAG].addEventListener(
      'click',
      this.listClickedLambda({
        renderChildView: this.renderMatchingItemsList.bind(this),
        selectionKey: SELECTED_NAMES.TAG
      })
    );

    //bind the additional event listener for clicking on a series title
    this.list[SELECTED_NAMES.SERIES].addEventListener(
      'click',
      this.listClickedLambda({
        renderChildView: this.renderSelectedItem.bind(this),
        selectionKey: SELECTED_NAMES.SERIES
      })
    );
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this));
  }

  clearButtonClicked() {
    this.clearSelection(SELECTED_NAMES.TAG);
    this.reset();
  }

  clearSelection(selectionKey) {
    let listObject = this.list[selectionKey];

    const hasOldSelection = typeof this.selected[selectionKey] !== 'undefined';

    if (hasOldSelection) {
      listObject.querySelectorAll('[data-item="' + this.selected[selectionKey] + '"]')[0]
        .classList.remove('active');
    }
  }

  getSortedIds(a, b) {
    if (this.data[a].title < this.data[b].title) {
      return -1;
    }
    if (this.data[a].title > this.data[b].title) {
      return 1;
    }
    if (this.data[a].id < this.data[b].id) {
      return -1;
    }
    if (this.data[a].id > this.data[b].id) {
      return 1;
    }
    return 0;
  }

  listClickedLambda({ renderChildView, selectionKey }) {
    return (event) => {
      let listObject = this.list[selectionKey];
      let target = event.target;
      let id = target.attributes['data-item'];
  
      const hasOldSelection = typeof this.selected[selectionKey] !== 'undefined';
      const hasNewSelection = typeof id !== 'undefined' && (
        !hasOldSelection || id.value !== this.selected[selectionKey]
      );
  
      if (hasNewSelection) {
        this.clearButton.removeAttribute('disabled');
        this.renderSelection(selectionKey, target);
        this.selected[selectionKey] = id.value;
        renderChildView(id.value);
      }
    };
  }

  render() {
    this.reset();
    this.list[SELECTED_NAMES.TAG].innerHTML = Object.keys(this.tags).sort().map(this.renderTag.bind(this)).join(' ');
    //render the list of tags from this.data into this.tagList
  }

  renderMatchingItem(id) {
    return this.TagBrowserView.matchingItem({ item: this.data[id] });
  }

  renderMatchingItemsList(tag) {
    const hasTagSelection = typeof tag !== 'undefined';

    if (hasTagSelection) {
      let sortedIds = Object.keys(this.tags[tag]).sort(this.getSortedIds.bind(this));
      const hasOldSeriesSelection = typeof this.selected[SELECTED_NAMES.SERIES] !== 'undefined';

      if (hasOldSeriesSelection) {
        delete this.selected[SELECTED_NAMES.SERIES];
      }
      this.list[SELECTED_NAMES.SERIES].innerHTML = sortedIds.map(this.renderMatchingItem.bind(this)).join(' ');
    } else {
      this.list[SELECTED_NAMES.SERIES].innerHTML = '';
    }
    this.matchingItemsTitle.innerHTML = this.TagBrowserView.matchingItemsTitle({ tag: tag });
    this.renderSelectedItem();
  }

  renderSelectedItem(id) {
    this.selectedItem.innerHTML = this.TagBrowserView.selectedItem({
      item: this.data[id]
    });
  }

  renderSelection(selectionKey, target) {
    const hasTarget = typeof target !== 'undefined';

    this.clearSelection(selectionKey);
    if (hasTarget) {
      target.classList.add('active');
    }
  }

  renderTag(tag) {
    return this.TagBrowserView.tag({ tag: tag });
  }

  reset() {
    this.clearButton.setAttribute('disabled', 'disabled');
    this.selected = {};
    this.renderMatchingItemsList();
  }
}
