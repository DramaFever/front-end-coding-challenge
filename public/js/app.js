export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.tags = [];
    this.data = [];

    this.fetchData()
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this));
  }

  render() {
    this.tagList.innerHTML = this.tags.map(tag => `<li><span class="tag is-link ${tag === this.activeTag ? "active" : ""}">${tag}</span></li>`).join("");
    this.matchingItemsList.innerHTML = this.matchingItems.map(item => `<li id=${item.id}>${item.title}</li>`).join("");
    this.selectedTagEl.innerHTML = this.activeTag;
    this.selectedTitleEl.innerHTML = this.selectedItem.title;
  }

  tagListClicked(event) {
    if (event.target.classList.contains('tag')) {
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
      this.selectedTagEl = this.config.element.querySelector('#selectedTag');
  }

  bindEventListeners() {
      this.tagList.addEventListener('click', this.tagListClicked.bind(this));
      this.matchingItemsList.addEventListener('click', this.matchingItemsListClicked.bind(this));
  }
}
