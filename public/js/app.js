import {bindAll, emptyAll} from '/js/util/helpers.js';
import Tag from '/js/components/tag.js';
import Show from '/js/components/show.js';

export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;
    this.shows = [];
    this.tags = new Map();
    this.selectedShow = 'NA';
    this.selectedTag = 'NA';

    bindAll(this, [
      'renderShowList',
      'renderShow',
      'tagListClicked',
      'showListClicked',
      'setData',
      'getElements',
      'bindEventListeners',
      'renderTags',
      'clear',
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
    this.clearBtn = $(this.config.element).find('.clear-button');
  }

  clear() {
    this.selectedShow = 'NA';
    this.selectedTag = 'NA';

    //remove toggled states
    $('.tag.active').toggleClass('active');
    $('.tag--show.active').toggleClass('active');

    //empty state
    emptyAll([
      this.showListElem,
      this.showInfoElem,
      this.tagTitleElem,
    ]);

    //set placeholders
    this.showListElem.append($('<li>No Tag Selected</li>'));
    this.showInfoElem.append($('<li>No Show Selected</li>'));
    this.clearBtn.attr("disabled",true);

  }

  bindEventListeners() {
    //tag events are bound on component level
    this.clearBtn.on('click', this.clear);
  }

  //todo: combine tagListClicked + showListClicked into one function that takes
  //config as a param.
  tagListClicked({target}) {
    target = $(target);
    const name = target.attr('data-name');

    //prevent clicking outside of spans
    if(!name){
      return
    }

    this.tagTitleElem.text(name);
    const currItems = this.tags.get(name);

    //remove previous active item
    this.tagListElem.find('.tag.active').toggleClass('active');
    //add current active item
    target.toggleClass('active');

    this.selectedTag = name;
    this.clearBtn.attr("disabled",false);
    this.renderShowList(currItems);
  }


  showListClicked({target}) {
    target = $(target);
    const name = target.attr('data-name');

    //prevent clicking outside of spans
    if(!name){
      return
    }

    const currShow = this.shows[name];
    this.showTitleElem.text(currShow.title);
    this.selectedShow = name;

    this.showListElem.find('.tag.active').toggleClass('active');
    target.toggleClass('active');
    this.renderShow(currShow);
  }

  renderTags() {
    //render the list of tags from this.data into this.tagList
    const tagElems = [];
    for (const [key] of this.tags) {
      tagElems.push(new Tag({
        name: key,
        id: key,
        onClick: this.tagListClicked,
        clickConfig: {

        },
        className: 'tag tag--genre'
      }))
    }
    this.tagListElem.append(tagElems)
  }

  renderShowList(items) {
    this.showListElem.empty();
    const showElems = [];
    for (const id of items) {
      const {title} = this.shows[id];
      showElems.push(new Tag({
          name: title,
          id,
          onClick: this.showListClicked,
          className: 'tag tag--show'
        })
      )
    }
    this.showListElem.append(showElems);
    //todo: animation here

  }

  renderShow(showData) {
    this.showInfoElem.empty();
    this.showInfoElem.append(new Show(showData));
  }

}
