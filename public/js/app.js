export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    // Default values
    this.activeTag = null;
    this.activeSeries = null;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.render.bind(this))
      .then(this.bindEventListeners.bind(this));

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
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.matchingItemsList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.selectedItemColumn = this.config.element.querySelectorAll('.selected-item.column')[0];
    this.clearButton = this.config.element.querySelectorAll('.button.clear-button')[0];
    this.listTitle = this.config.element.querySelectorAll('.column.content > .subtitle')[0];
    //find and store other elements you need
  }

  render() {
    //render the list of tags from this.data into this.tagList
    this.clearButtonToggler()
    this.renderTags();
    this.renderContent();
    this.renderSeries();
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.matchingItemsList.addEventListener('click', this.matchingItemsListClicked.bind(this));
    this.clearButton.addEventListener('click', this.clearButtonClicked.bind(this));
    //bind the additional event listener for clicking on a series title
  }

  renderSeries() {
    var activeSeries = this.activeSeries;

    var selectedItemColumn = this.selectedItemColumn;
    var content = document.createElement('div');
    var subtitle = document.createElement('h3');
    var img = document.createElement('img');
    var p = document.createElement('p');

    var ul = document.createElement('ul');
    var rating = document.createElement('li');
    var nativeLanguageTitle = document.createElement('li');
    var sourceCountry = document.createElement('li');
    var type = document.createElement('li');
    var episodes = document.createElement('li');

    var seriesInfo = [rating, nativeLanguageTitle, sourceCountry, type, episodes];
    var labels = ['Rating', 'Native Language Title', 'Source Country', 'Type', 'Episodes'];

    selectedItemColumn.innerHTML = '';
    content.classList.add('content');    
    subtitle.classList.add('subtitle');

    seriesInfo.forEach(function(info, i) {
      var strong = document.createElement('strong');
      strong.innerHTML = labels[i] + ': ';
      info.append(strong);
    });

    subtitle.innerHTML = 'No Series Selected';
    img.setAttribute('src', 'http://via.placeholder.com/350x350');
    p.innerHTML = '';

    if (activeSeries) {
      this.data.forEach(function (row) {
        if (row.id == activeSeries) {
          subtitle.innerHTML = row.title;
          img.setAttribute('src', row.thumbnail);
          p.innerHTML = row.description;

          var seriesData = [row.rating, row.nativeLanguageTitle, row.sourceCountry, row.type, row.episodes];
          seriesInfo.forEach(function(info, i) {
            var span = document.createElement('span');
            span.innerHTML = seriesData[i];
            seriesInfo[i].append(span);
          });
        }
      });
    }

    content.append(subtitle);
    content.append(img);
    content.append(p);

    ul.append(rating);
    ul.append(nativeLanguageTitle);
    ul.append(sourceCountry);
    ul.append(type);
    ul.append(episodes);

    selectedItemColumn.append(content);
    selectedItemColumn.append(ul);
  }

  renderContent() {
    var matchingItemsList = this.matchingItemsList;
    var selectedItemColumn = this.selectedItemColumn.children;
    var listTitle = this.listTitle;
    var activeTag = this.activeTag;
    var activeSeries = this.activeSeries;
    var seriesList = [];

    matchingItemsList.innerHTML = '';

    if (activeTag) {
      listTitle.innerHTML = activeTag;
      this.data.forEach(function(row) {
        if (row.tags.indexOf(activeTag) > -1) {
          seriesList.push(row);
        }
      });

      seriesList.forEach(function(series) {
        var li = document.createElement('li');
        var a = document.createElement('a');

        if (activeSeries == series.id) {
          a.classList.add('active');
        }
        a.innerHTML = series.title;
        a.setAttribute('data',series.id);
        li.append(a);
        matchingItemsList.append(li);
      });

    } else {
      listTitle.innerHTML = 'No Tag Selected.';
    }

    this.listTitle = listTitle;
    this.matchingItemsList = matchingItemsList;
  }

  renderTags() {
    var activeTag = this.activeTag;
    var tagList = this.tagList;
    var tags = [];

    tagList.innerHTML = '';

    this.data.forEach(function(row) {
      row.tags.forEach(function(tag) {
        if(!tags.includes(tag)) {
          tags.push(tag);
        }
      })
    });

    tags.sort();

    tags.forEach(function(tag) {
      var element = document.createElement('li');
      var span = document.createElement('span');

      span.classList.add('tag','is-link');

      if (activeTag === tag) {
        span.classList.add('active');
      }

      span.innerHTML = tag;
      element.append(span);
      tagList.append(element);
    })

    this.tagList = tagList;
  }

  clearButtonToggler() {
    (this.activeTag || this.activeSeries) ? this.clearButton.removeAttribute('disabled') :  this.clearButton.setAttribute('disabled', '');
  }
  
  tagListClicked(event) {
    // console.log('tag list (or child) clicked', event);
    if (event.target.tagName == 'SPAN') {
      if (!event.target.classList.contains('active')) {
        this.activeTag = event.target.innerHTML;
      } else {
        this.activeTag = null;
      }
      this.activeSeries = null;
    }
    this.render();
  }

  matchingItemsListClicked(event) {
    // console.log('matching items', event);
    if (event.target.tagName == 'A') {
      var id = event.target.getAttribute('data');
      this.activeSeries = id;
    }
    this.render();
  }
  

  clearButtonClicked(event) {
    this.activeTag = null;
    this.activeSeries = null;
    this.render();
  }
}
