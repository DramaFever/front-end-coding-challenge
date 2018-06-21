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

        selectedTag= '';

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

    var tagTitle = $('#selected-tag.subtitle'),
        selectedTag = this.currentTag,
        fullList = this.data


    $('li[data-hook]').click(function() {
      //e.preventDefault();

        var currentTag = $(this).data('hook');

        selectedTag =  currentTag;

        $(tagTitle).html( currentTag );


// find selected titles --

  $.each(fullList, hasTag)

  var invalidEntries = 0,

      matchingTitles = []


  function hasTag(obj){

    var itemsTags = obj.tags,
        itemID = obj.id;

    if(jQuery.inArray( currentTag , itemsTags) !== -1){

            matchingTitles.push( itemID )
            //console.log( 'current item is good-- ', );
    }
    else{
      //  console.log(  'current item does not match -- ');
    }

  } //end hasTag


var matches = fullList.filter(hasTag);

//console.log(matches);

//the list of series that have the matching tags

 function hasID(obj){

    //console.log( 'Matching IDs \n',  matchingTitles);

    if( matchingTitles.includes(obj.id) ) {

        return obj
    }
  //  return obj.id.indexOf(matchingTitles) > -1 ;
}

var matchingObjs = fullList.filter( hasID );
console.log( 'Matching Objs \n', matchingObjs);

//clear list first
$('.matching-items-list').html('');

function populateMatchList( i, item){

  console.log( item , 'Matched items \n');

  $('.matching-items-list').append( '<li class="matched-title" data-id" '+item.id+ ' ">'+item.title+'</li>' )
}


  $.each(matchingObjs, populateMatchList )


//


      }); //end click event

  }//end render


  tagListClicked(event) {
  //  console.log('tag list (or child) clicked', event);

    //check to see if it was a tag that was clicked and render ?

//cannot seem to get the eventbinding, so moved it to render :(

  }

}
