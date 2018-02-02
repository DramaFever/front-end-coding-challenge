export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.tags = [];
    this.data = [];

    this.setToDefaults();

    this.fetchData()
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this));
  }

  setToDefaults() {
      this.selectedItem = {
          thumbnail: "http://via.placeholder.com/350x350",
          title: "No Series Selected",
          description: "",
          rating: "",
          nativeLanguageTitle: "",
          episodes: "",
          type: "",
          sourceCountry: ""
      };

      this.activeTag = "No Tag Selected";
      this.selectedMatchingItemsIndex = -1;
      this.matchingItems = [];

      this.data.forEach((item) => {
        item.isActive = false;
      });
  }

  render() {
    this.tagList.innerHTML = this.tags.map(tag => `<li><span class="tag is-link ${tag === this.activeTag ? "active" : ""}">${tag}</span></li>`).join("");
    this.matchingItemsList.innerHTML = this.matchingItems.map(item => `<li id=${item.id} class=${item.isActive ? "active" : ""}>${item.title}</li>`).join("");
    this.selectedTagEl.innerHTML = this.activeTag;
    this.selectedTitleEl.innerHTML = this.selectedItem.title;
    this.itemImgEl.src = this.selectedItem.thumbnail;
    this.itemDescriptionEl.innerHTML = this.selectedItem.description;
    this.itemMetadata.innerHTML = `
      <li><strong>Rating:</strong> <span>${this.selectedItem.rating}</span></li>
      <li><strong>Native Language Title:</strong> <span>${this.selectedItem.nativeLanguageTitle}</span></li>
      <li><strong>Source Country:</strong> <span>${this.selectedItem.sourceCountry}</span></li>
      <li><strong>Type:</strong> <span>${this.selectedItem.type}</span></li>
      <li class="${this.selectedItem.type === "movie" ? "hidden" : ""} "><strong>Episodes:</strong> <span>${this.selectedItem.episodes}</span></li>
    `
  }
  
  tagListClicked(event) {
    if (event.target.classList.contains('tag')) {
        this.setToDefaults();

        const tag = event.target.innerText;

        this.activeTag = tag;
        this.matchingItems = this.data.filter(item => item.tags.indexOf(tag) !== -1);

        this.render();
    }
  }

  matchingItemsListClicked(event) {
    if (this.selectedMatchingItemsIndex !== -1) {
        this.matchingItems[this.selectedMatchingItemsIndex].isActive = false;
    }

    this.selectedMatchingItemsIndex = this.matchingItems.findIndex(item => item.id.toString() === event.target.id);
    this.matchingItems[this.selectedMatchingItemsIndex].isActive = true;
    this.selectedItem = this.matchingItems[this.selectedMatchingItemsIndex];

    this.render();
  }

  clearButtonClicked() {
    this.setToDefaults();
    this.render();
  }

  fetchData() {
    return new Promise((resolve, reject) => {
        //ajax the data and resolve the promise when it comes back
        $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
      this.data = data;
      this.tags = [...new Set([].concat.apply([], data.map(item => item.tags)))].sort();
  }

  getElements() {
      this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
      this.matchingItemsList = this.config.element.querySelectorAll('.matching-items-list')[0];
      this.selectedTagEl = this.config.element.querySelector('#selected-tag');
      this.selectedTitleEl = this.config.element.querySelector('#selected-title');
      this.itemImgEl = this.config.element.querySelector('#item-img');
      this.itemDescriptionEl = this.config.element.querySelector('#item-description');
      this.itemMetadata = this.config.element.querySelector('#metadata');
      this.clearButton = this.config.element.querySelectorAll('.clear-button')[0];
  }

  bindEventListeners() {
      this.tagList.addEventListener('click', this.tagListClicked.bind(this));
      this.matchingItemsList.addEventListener('click', this.matchingItemsListClicked.bind(this));
      this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this));
  }
}
