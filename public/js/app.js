export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      .then((data) => this.setData(data))
      .then(() => this.getElements())
      .then(() => this.bindEventListeners())
      .then(() => this.render())
      .catch((err) => console.error(error));

    console.log('Widget Instance Created');
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.data = data;

    const tags = this.data.reduce((tags, item) => tags.concat(item.tags), []);
    this.tags = [...new Set(tags)];
    this.tags.sort();

    this.items = new Map();
    this.data.forEach((item) => this.items.set(item.id, item));
  }

  getElements() {
    const element = this.config.element;

    this.tagList = element.querySelector('.tag-list');
    this.itemsListTitle = element.querySelector('.items-list-title');
    this.matchingItemsList = element.querySelector('.matching-items-list');
    this.clearButton = element.querySelector('.js-clear-button');

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

    $(this.clearButton).on('click', (event) => {
      this.clearSelection();
    });
  }

  render() {
    let tagListHtml = '';

    for (const tag of this.tags) {
      tagListHtml += `<li><button class="js-tag tag button is-small is-link" data-tag="${tag}">${tag}</button></li>`;
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
  }

  renderItemsList(tag, items) {
    this.itemsListTitle.innerText = tag;

    let itemsListHtml = '';

    for (const item of items) {
      const active = this.selectedItem == item.id ? ' is-active' : '';
      itemsListHtml += `<li><a data-id="${item.id}" class="js-item${active}">${item.title}</a></li>`;
    }

    this.matchingItemsList.innerHTML = itemsListHtml;
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
      title: 'No Series Selected',
      description: '',
      thumbnail: 'https://via.placeholder.com/350x350',
      rating: '',
      nativeLanguageTitle: '',
      sourceCountry: '',
      type: '',
      episodes: ''
    });
  }

  setSelectedItem(id) {
    this.selectedItem = id;
    this.setSelected(this.matchingItemsList, `[data-id="${id}"]`);
  }

  renderItem(item) {
    this.seriesTitle.innerText = item.title;
    this.description.innerText = item.description;
    this.seriesImage.src = item.thumbnail;
    this.ratingLabel.innerText = item.rating;
    this.nativeLanguageTitleLabel.innerText = item.nativeLanguageTitle;
    this.sourceCountryLabel.innerText = item.sourceCountry;
    this.typeLabel.innerText = item.type;
    this.numberOfEpisodesLabel.innerText = item.episodes;
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
