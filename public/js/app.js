export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.render.bind(this));

    // console.log('Widget Instance Created');
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.data = data;
    // console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    //find and store other elements you need
    this.clearBtn = this.config.element.querySelectorAll('.clear-button')[0];
    this.noTagSelected = $('.selected-tag').clone();
    this.noSeriesSelected = $('.selected-item').clone();
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title
    this.clearBtn.addEventListener('click', this.clearBtnClicked.bind(this));
  }

  // retrieve all tags, flatten array, filter duplicate tags, sort alphabetically
  getSortedTags() {
    return this.data.map(series => series.tags)
      .reduce((a, b) => a.concat(b))
      .filter((el, i, a) => i === a.indexOf(el))
      .sort();
  }

  // retrieve all series for a selected tag
  getSeriesForSelectedTag(selectedTag) {
    return this.data.filter(series => series.tags.indexOf(selectedTag) > -1)
  }

  // added animation to tag list section
  // replaced <span> with <a> tag for semantically correct markup
  render() {
    //render the list of tags from this.data into this.tagList
    let tagListElem = $(this.tagList);
    let tags = this.getSortedTags();
    // console.log(tags);

    tagListElem.empty();
    tags.forEach(tag => {
      let dataTag = tag.split(' ').join('-');
      let tagItemElem = `<li class="animated fadeInDown"><a class="tag is-link" id="${dataTag}">${tag}</a></li>`;
      tagListElem.append(tagItemElem);
    })

    // set clear button to non-clickable
    $(this.clearBtn).attr('disabled', true);
  }

  // added animation for series list section
  // it can be improved given more time to play with it
  // replaced <span> with <a> tag for semantically correct markup
  tagListClicked(event) {
    // console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
    event.preventDefault();
    let selectedTag = event.target.innerHTML;
    let seriesListElem = $('.matching-items-list');
    let series = this.getSeriesForSelectedTag(selectedTag);
    // console.log(series);

    // set tag title
    $('.selected-tag-title').html(`${selectedTag}`)

    // set active class for tag list section
    $('#' + event.target.id).addClass('active animated pulse').parent().siblings().find('.active').removeClass('active animated pulse');

    seriesListElem.empty();
    series.forEach(s => {
      let seriesItemElem = `<li class="animated fadeInDown"><a id="${s.id}" data-series-id="${s.id}">${s.title}</a></li>`;
      seriesListElem.append(seriesItemElem);
      $('#' + s.id).data('data-series', s);
      $('#' + s.id).click(this.seriesClicked);
    })

    // set clear button to clickable
    $(this.clearBtn).attr('disabled', false);
  }

  // added animation for series details section
  // it can be improved given more time to play with it
  seriesClicked(event) {
    // console.log('series clicked', event);
    event.preventDefault();
    let selectedSeries = $(this).data('data-series');
    // console.log(selectedSeries);

    // set active class and details for series
    $(this).addClass('active').parent().siblings().find('.active').removeClass('active');
    $('.selected-item').find('.title').html(selectedSeries.title);
    $('.selected-item').find('.thumbnail').attr('src', selectedSeries.thumbnail);
    $('.selected-item').find('.description').html(selectedSeries.description);
    $('.selected-item').find('.rating').html(selectedSeries.rating);
    $('.selected-item').find('.native-language-title').html(selectedSeries.nativeLanguageTitle);
    $('.selected-item').find('.source-country').html(selectedSeries.sourceCountry);
    $('.selected-item').find('.type').html(selectedSeries.type);
    $('.selected-item').find('.episodes').html(selectedSeries.episodes);
  }

  // replaced <a> with <button> tag for semantically correct markup
  clearBtnClicked(event) {
    $(this.tagList).find('.active').removeClass('active');
    $('.selected-tag').replaceWith(this.noTagSelected.clone());
    $('.selected-item').replaceWith(this.noSeriesSelected.clone());
    $(this.clearBtn).attr('disabled', true);
  }
}
