export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      .then((data) => this.setData(data))
      .then(() => this.getElements())
      .then(() => this.bindEventListeners())
      .then(() => this.render())
      .catch((err) => console.error(err));
  }

  fetchData() {
    return $.get('/js/data.json');
  }

  setData(data) {
    this.data = data;

    const tags = this.data.reduce((tags, item) => tags.concat(item.tags), []);
    this.tags = [...new Set(tags)];
    this.tags.sort((a, b) => a.localeCompare(b));

    this.items = new Map();
    this.data.forEach((item) => this.items.set(item.id, item));
  }

  getElements() {
    const {element} = this.config;

    this.tagList = element.querySelector('.tag-list');
    this.itemsListTitle = element.querySelector('.items-list-title');
    this.matchingItemsList = element.querySelector('.matching-items-list');
    this.clearButton = element.querySelector('.js-clear-button');

    this.seriesBox = element.querySelector('.js-series-box');
    this.seriesTitle = element.querySelector('.js-series-title');
    this.seriesImage = element.querySelector('.js-series-image');
    this.description = element.querySelector('.js-series-description');
    this.ratingLabel = element.querySelector('.js-series-rating');
    this.nativeLanguageTitleLabel = element.querySelector('.js-series-native-language-title');
    this.sourceCountryLabel = element.querySelector('.js-series-source-country');
    this.typeLabel = element.querySelector('.js-series-type');
    this.numberOfEpisodesLabel = element.querySelector('.js-series-number-of-episodes');
  }

  bindEventListeners() {
    $(this.tagList).on('click', '.js-tag', (event) => {
      this.onTagSelected(event.target.getAttribute('data-tag'));
    });

    $(this.matchingItemsList).on('click', '.js-item', (event) => {
      this.onItemSelected(parseInt(event.target.getAttribute('data-id'), 10));
      return false;
    });

    $(this.clearButton).on('click', () => {
      this.clearSelection();
    });
  }

  render() {
    let tagListHtml = '';

    for (const [index, tag] of this.tags.entries()) {
      tagListHtml += `<li style="--delay: ${index * 20}ms" class="anim-slide-in"><button class="js-tag tag button is-small is-link" data-tag="${tag}">${tag}</button></li>`;
    }

    this.tagList.innerHTML = tagListHtml;
  }

  setSelected(element, selector, className = 'is-active') {
    const currentlySelected = element.querySelector(`.${className}`);
    if (currentlySelected) {
      currentlySelected.classList.remove(className);
    }

    const newlySelected = element.querySelector(selector);
    if (newlySelected) {
      newlySelected.classList.add(className);
    }
  }

  getItemsForTag(tag) {
    return this.data.filter((item) => item.tags.includes(tag));
  }

  onTagSelected(tag) {
    const item = this.getItemsForTag(tag);

    if (tag) {
      this.setSelectedTag(tag);
      this.renderItemsList(tag, item);
      this.toggleClearButton(true);
      return;
    }

    this.setSelectedTag(null);
    this.renderItemsList('No Tag Selected', []);
  }

  setSelectedTag(tag) {
    this.setSelected(this.tagList, `[data-tag="${tag}"]`);
    window.location.hash = 'item-list';
  }

  renderItemsList(tag, items) {
    this.itemsListTitle.innerText = tag;

    let itemsListHtml = '';

    for (const [index, item] of items.entries()) {
      const active = this.selectedItem === item.id ? ' is-active' : '';
      itemsListHtml += `<li style="--delay: ${index * 20}ms" class="trans-slide-in"><a data-id="${item.id}" class="item js-item${active}">${item.title}</a></li>`;
    }

    const updateHtml = () => {
      this.matchingItemsList.innerHTML = itemsListHtml;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          $(this.matchingItemsList).children().addClass('in');
        });
      });
    };

    const existingListItems = this.matchingItemsList.querySelectorAll('li');
    if (existingListItems.length > 0) {
      existingListItems[existingListItems.length - 1].addEventListener('transitionend', () => {
        updateHtml();
      });

      $(existingListItems).removeClass('in');
      return;
    }

    updateHtml();
  }

  onItemSelected(id) {
    const item = this.items.get(id);

    if (item) {
      this.setSelectedItem(id);
      this.renderItem(item);
      return;
    }

    window.location.hash = '';
    this.setSelectedItem(null);
    this.renderItem({
      title: 'No Series Selected'
    });
  }

  setSelectedItem(id) {
    this.selectedItem = id;
    this.setSelected(this.matchingItemsList, `[data-id="${id}"]`);
    window.location.hash = 'item';
  }

  renderItem(item) {
    const fadeOut = (element) => {
      return new Promise((resolve) => {
        if (!element.classList.contains('in')) {
          resolve();
          return;
        }

        const handler = () => {
          element.removeEventListener('transitionend', handler, false);
          resolve();
        };

        element.addEventListener('transitionend', handler, false);
        element.classList.remove('in');
      });
    };

    const preloadImage = (src) => {
      return new Promise((resolve, reject) => {
        if (!src) {
          reject(new Error('Invalid url'));
        }

        const img = new Image();
        img.addEventListener('load', () => resolve(src));
        img.src = src;
      });
    };

    fadeOut(this.seriesBox)
      .then(() => {
        this.seriesTitle.innerText = item.title;
      })
      .then(() => {
        return preloadImage(item.thumbnail);
      })
      .then(() => {
        this.description.innerText = item.description;
        this.seriesImage.src = item.thumbnail;
        this.ratingLabel.innerText = item.rating;
        this.nativeLanguageTitleLabel.innerText = item.nativeLanguageTitle;
        this.sourceCountryLabel.innerText = item.sourceCountry;
        this.typeLabel.innerText = item.type;
        this.numberOfEpisodesLabel.innerText = item.episodes;

        this.seriesBox.classList.add('in');
      })
      .catch(() => {
        // No image, do nothing
      });
  }

  toggleClearButton(enabled) {
    if (enabled !== undefined) {
      this.clearButton.disabled = !enabled;
      return;
    }

    this.clearButton.disabled = !this.clearButton.disabled;
  }

  clearSelection() {
    this.onTagSelected(null);
    this.onItemSelected(null);
    this.toggleClearButton(false);
  }
}
