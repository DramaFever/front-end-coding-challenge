export default class TagBrowserWidget { 
  constructor(config) {
    this.config = config;
    this.MOVIES = [];
    this.MoviesSeries = [];

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
    // transform dataset
    this.MOVIES  = this.data.map(movie => movie.tags.map(tag=>({id: movie.id, title:movie.title,tag:tag})));
    //flatten
    this.MOVIES = [].concat(...this.MOVIES );     
  }
  getElements() {  
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.seriesList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.btnClear  = this.config.element.querySelectorAll('.clear-button')[0];    
  }
  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.seriesList.addEventListener('click', this.seriesListClicked.bind(this));
    this.btnClear.addEventListener('click',this.btnClearClicked.bind(this));    
    $(this.btnClear).hide();
  }
  render() {    
    this.displayTags();   
  }
  //display unique tags, alphabatically
  displayTags(){  
    // remove dublicate
    var uniqueData = this.MOVIES.filter((movie, index, self) =>
        index === self.findIndex((t) => (
          t.tag === movie.tag
        ))
      )
      //Sort
     uniqueData =uniqueData.sort((a, b) => a.tag < b.tag ? -1 : 1);
       
      var ul = this.tagList;
      ul.innerHTML = '';
      uniqueData.map(movie=>{
        var li = document.createElement("li");        
        var span = document.createElement("span");       
        span.setAttribute("class","is-link tag");      
        span.setAttribute("id",movie.id);    
        span.appendChild(document.createTextNode(movie.tag))
        li.appendChild(span) 
        ul.appendChild(li);  
      })   
      
     
  }
  btnClearClicked(){       
      this.seriesList.innerHTML='';
      $("ul.tag-list li span").removeClass('active');

      $('#selectedTag').text('[SELECTED TAG]');
      $("ul.matching-items-list li").removeClass('active');       
      $('#subtitle').text('[SELECTED SERIES TITLE]');    
      $("#img").attr("src",'http://via.placeholder.com/350x350');
      $('#descirption').text(''); 
      $('#rating').text(''); 
      $('#lan').text(''); 
      $('#country').text(''); 
      $('#series').text(''); 
      $('#episodes').text(''); 
      $(this.btnClear).hide();
    
  }
  tagListClicked(event) {   
    $("ul.tag-list li span").removeClass('active');
    event.srcElement.setAttribute('class','is-link tag active');         
    this.MoviesSeries = this.MOVIES.filter(movie=>  movie.tag===event.srcElement.innerHTML );
    var ul = this.seriesList;
    ul.innerHTML = '';  
    this.MoviesSeries.map(movie=>{
            var li = document.createElement("li");  
            li.setAttribute("id",movie.id);    
            li.appendChild(document.createTextNode(movie.title))            
            ul.appendChild(li);  
            $('#selectedTag').text(movie.tag);
          })   
          $(this.btnClear).show();           
    }  
    seriesListClicked(event){      
    $("ul.matching-items-list li").removeClass('active');
    event.srcElement.setAttribute('class','active');    
    var selecteMovie =  this.data.filter(movie=> movie.id===+event.srcElement.id)[0];
      $('#subtitle').innerHTML =selecteMovie.title;   
      $('#subtitle').text(selecteMovie.title);    
      $("#img").attr("src",selecteMovie.thumbnail);
      $('#descirption').text(selecteMovie.description);
      $('#rating').text(selecteMovie.rating);
      $('#lan').text(selecteMovie.nativeLanguageTitle);
      $('#country').text(selecteMovie.sourceCountry);
      $('#series').text(selecteMovie.type);
      $('#episodes').text(selecteMovie.episodes);  
    }  
  }
