import {bindAll} from '/js/util/helpers.js';

export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.shows = [];
    this.tags = new Map();


    bindAll(this,[
      'renderShowList',
      'renderShow',
      'tagListClicked',
      'showListClicked',
      'setData',
      'getElements',
      'bindEventListeners',
      'renderTags',
    ]);

    this.fetchData()
    //use .bind because native promises change the "this" context
      .then(this.setData)
      .then(this.getElements)
      .then(this.bindEventListeners)
      .then(this.renderTags);

    console.log('Widget Instance Created');
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      $.get('/js/data.json', resolve);
    });
  }

  setData(data) {
    this.shows = data;
    let showData = {};

    //create structure for tags (costly, but only 1x indexing needed)
    this.shows.forEach((show, i) => {
      const {tags, id} = show;
      showData[id] = show;

      tags.forEach((tag, i2) => {

        tag = tag.toLowerCase();
        this.tags.set(tag, [
          ...this.tags.get(tag) || [],
          id
        ]);
      });
    });
    this.shows = showData;

    //maps enforce order they are constructed in
    this.tags = new Map([...this.tags.entries()].sort());

    //final pass to sort the shows stored in the arrays
    this.tags.forEach((value, key) => {
      this.tags.set(key, value.sort());
    });
  }

  getElements() {
    // console.log(this.config.element)
    this.tagListElem = $(this.config.element).find('.tag-list');
    this.showListElem = $(this.config.element).find('.matching-items-list');
    this.showTitleElem = $(this.config.element).find('.show__title');
    this.tagTitleElem = $(this.config.element).find('.tag-title');
    this.showInfoElem = $(this.config.element).find('.show');
    // this.tagListElem =

    // console.log(this.tagListElem)
    //find and store other elements you need
  }

  bindEventListeners() {
    this.tagListElem.on('click', this.tagListClicked);
    this.showListElem.on('click', this.showListClicked);
  }

  tagListClicked({target}) {
    target = $(target);
    const name = target.attr('data-name');
    this.tagTitleElem.text(name);

    //remove previous active item
    $('.tag.active').toggleClass('active');
    //add current active item
    target.toggleClass('active');
    const currItems = this.tags.get(name);
    this.renderShowList(currItems);
  }

  showListClicked({target}) {
    const name = $(target).attr('data-name');
    const currShow = this.shows[name];
    this.showTitleElem.text(currShow.title);
    this.renderShow(currShow);
  }

  renderTags() {
    //render the list of tags from this.data into this.tagList
    const tagElems = [];
    for (const [key] of this.tags) {
      tagElems.push($(`<li><span class='tag' data-name="${key}" class="tag is-link">${key}</span></li>`))
    }
    this.tagListElem.append(tagElems)
  }

  renderShowList(items) {

    this.showListElem.empty();
    const showElems = [];
    for (const id of items) {
      const {title} = this.shows[id];
      showElems.push($(`<li data-name="${id}" >${title}</li>`))
    }
    this.showListElem.append(showElems)
  }

  renderShow(show) {
    this.showInfoElem.empty();
    const {
      type,
      rating,
      episodes,
      sourceCountry,
      description,
      title,
      nativeLanguageTitle,
      thumbnail
    } = show;
    const showTmpl = `<div class="content">
              <h3 class="subtitle show__title">${title}</h3>
              <img class='show__img' src="${thumbnail}" />
              <p class='show__desc'>
              ${description}
              </p>
            </div>
            <ul class='show__details'>
              <li><strong>Rating:</strong> <span>${rating}</span></li>
              <li><strong>Native Language Title:</strong> <span>${nativeLanguageTitle}</span></li>
              <li><strong>Source Country:</strong> <span>${sourceCountry}</span></li>
              <li><strong>Type:</strong> <span>${type}</span></li>
              <li><strong>Episodes:</strong> <span>${episodes}</span></li>
            </ul>
          `;
    this.showInfoElem.append(showTmpl)
  }

}
