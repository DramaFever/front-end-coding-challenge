export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.getUniqueCategory.bind(this))
      .then(this.getEntryByCategory.bind(this))
      .then(this.renderEntryByCategory.bind(this))
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
    //all cureent data in provided JSON
    this.data = data;
    console.log('Data fetched', this.data);
  }

  getEntryByCategory(category) {
    //to be called when a category is clicked on in the far left column
    var entriesByCategory = [];

    this.clearSelectedEntries();

    this.data.forEach(function(element){ 
      var currentElem = element;

      var found = currentElem.tags.find(function(element) {
        var el = element.toLowerCase();
        return el == category;
      });

      //add entry if a match is found
      if (found) {
        entriesByCategory.push(element);
      }
    });
    this.currentEntries = entriesByCategory;
    this.renderEntryByCategory();
  }

  getSelectedEntry(entry) {
    var entryID = entry;

    var thumbnail = document.getElementById("thumbnail");
    var description = document.getElementById("description");
    var type = document.getElementById("type");
    var rating = document.getElementById("rating");
    var nativeLanguageTitle = document.getElementById("native-language-title");
    var episodes = document.getElementById("episodes");
    var country = document.getElementById("country");

    this.clearSelectedEntry();

    var selectedEntry = this.data.find(function(element) {
      return element.id == entryID;
    });

    thumbnail.src = selectedEntry.thumbnail;
    description.innerHTML = selectedEntry.description;
    type.innerHTML = selectedEntry.type;
    rating.innerHTML = selectedEntry.rating;
    nativeLanguageTitle.innerHTML = selectedEntry.nativeLanguageTitle;
    episodes.innerHTML = selectedEntry.episodes;
    country.innerHTML = selectedEntry.sourceCountry;

    this.selectedEntry = selectedEntry;
    console.log(this.selectedEntry);
  }

  renderEntryByCategory() { 

    this.clearSelectedEntries();
    var ul = this.selectedTagList;

    for(var i =0; i<this.currentEntries.length; i++) {
        var entryTitle = this.currentEntries[i].title;
        var entryID = this.currentEntries[i].id;
        //create span node to live within LI
        var entryContent = document.createElement('span');
        //adding data attr
        entryContent.setAttribute('data-entry-by-cat', entryID);

        //add class name
        //entryContent.className = '';
        entryContent.innerHTML = entryTitle;
        
        //create LI node
        var li = document.createElement('li');

        //give LI node some content
        li.appendChild(entryContent);
        
        //add it to the UL structure
        ul.appendChild(li);
    }
  }

  //get unique tags for listing purposes
  getUniqueCategory() {
    //itereate over list of entries using map
    //callback function makes array of unique tags based on the tag array
    //return newly created array

    var data = this.data;

    //parse out all tags
    var uniqueTags = data.reduce(function(prev, curr) {
      return [...prev, ...curr.tags];
    }, ''); 

    //remove duplicates
    var dedupedTags = uniqueTags.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });

    //covert all entries to lower case    
    dedupedTags = dedupedTags.map(function(x){ return x.toLowerCase() });

    //return sorted array
    this.sortedTags = dedupedTags.sort();

  }

  getElements() {
    //find and store other elements you need
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.selectedTagList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.clear = this.config.element.querySelectorAll("#clear")[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.selectedTagList.addEventListener('click', this.selectedEntryClicked.bind(this));
    this.clear.addEventListener('click', this.clearAll.bind(this));
    //bind the additional event listener for clicking on a series title
  }

  render() {
    const ul = this.tagList;
    //render the list of tags from this.data into this.tagList
    for(var i =0; i<this.sortedTags.length; i++) {
        //create span node to live within LI
        var categoryContent = document.createElement('span');
        //adding data attr
        categoryContent.setAttribute('data-category', this.sortedTags[i]);

        //add class name
        categoryContent.className = 'tag is-link';
        //give it markup
        categoryContent.innerHTML = this.sortedTags[i];
        
        //create LI node
        var li = document.createElement('li');

        //give LI node some content
        li.appendChild(categoryContent);
        
        //add it to the UL structure
        ul.appendChild(li);
    }
  }

  clearAll() {
    this.clearTagsList();
    this.clearSelectedEntries();
    this.clearSelectedEntry();
  }

  clearTagsList() {
    var ul = this.tagList;

    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }

  clearSelectedEntries(){
    var ul = this.selectedTagList;

    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }

  clearSelectedEntry() {
    var thumbnail = document.getElementById("thumbnail");
    var description = document.getElementById("description");
    var type = document.getElementById("type");
    var rating = document.getElementById("rating");
    var nativeLanguageTitle = document.getElementById("native-language-title");
    var episodes = document.getElementById("episodes");
    var country = document.getElementById("country");

    thumbnail.src = '';
    description.innerHTML = '';
    type.innerHTML = '';
    rating.innerHTML = '';
    nativeLanguageTitle.innerHTML = '';
    episodes.innerHTML = '';
    country.innerHTML = '';
  }

  tagListClicked(event) {
    var category = event.target.getAttribute("data-category");

    this.getEntryByCategory(category);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }

  selectedEntryClicked(event) {
    var selectedEntry = event.target.getAttribute("data-entry-by-cat");

    this.getSelectedEntry(selectedEntry);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }
}
