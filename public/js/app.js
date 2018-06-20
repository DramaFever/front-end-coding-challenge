export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;



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

  setData(data) {
    this.data = data;
    console.log('Data fetched', this.data);
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];

    //find and store other elements you need




  }

  bindEventListeners() {

    this.tagList.addEventListener('click', this.tagListClicked.bind(this));

    //bind the additional event listener for clicking on a series title

  }


  render() {
    //render the list of tags from this.data into this.tagList

    let movieTagsArr = [];

        this.currentTag= '';

      // Loop thru the series for tags
      $.each(this.data, walker);

      function walker(key, value) {

        const movieTags = value.tags;

        movieTagsArr = movieTagsArr.concat( movieTags );

      }

      //filter for unique tags
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
}

      movieTagsArr = movieTagsArr.filter(onlyUnique).sort((a, b) => {
                      return a.toLowerCase().localeCompare(b.toLowerCase());
                    });


    $.each( movieTagsArr, function( key, tag ) {
      $('<li>', {
        html: tag
      })
      .attr('data-hook', tag)
      .bind('click', tag.action)
      .appendTo( '.tag-list' );
    });

    var tagTitle = $('#selected-tag.subtitle');

    $('li[data-hook]').click(function() {
      //e.preventDefault();

    var currentTag = $(this).data('hook');

    //currentTag =  ( this.selectedTag );

      console.log('tag name clicked', currentTag );

      this.currentTag =  currentTag;

      $(tagTitle).html( currentTag );

  });

  // find selected titles -- not working

    console.log('currentTag--', this.currentTag );

    var fullList = this.data

    var results = $(fullList).filter(this.currentTag );

    var filteredArray = fullList.filter(function(itm){
  return this.currentTag.indexOf(itm.this.currentTag) > -1;
});

filteredArray = { records : filteredArray };

console.log('curentTag--', results);
  }//end render


  tagListClicked(event) {
  //  console.log('tag list (or child) clicked', event);
    //check to see if it was a tag that was clicked and render

//cannot seem to get binding, have to click 2xs to get the attribute, so moved it to render :(

    //the list of series that have the matching tags

    // still need to filter thru obj and return titles that contain currentTag



  }

}
