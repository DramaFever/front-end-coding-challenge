export default class TagBrowserWidget {
    constructor(config) {
        this.config = config;
        $(".clear-button").attr("disabled",true);

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
        this.titleList = this.config.element.querySelectorAll('.matching-items-list')[0];
        this.clearList = this.config.element.querySelectorAll('.clear-button')[0];
        console.log('Data fetched', this.tagList);
        //find and store other elements you need
    }

    bindEventListeners() {
        this.tagList.addEventListener('click', this.tagListClicked.bind(this));
        this.titleList.addEventListener('click', this.titleListClicked.bind(this));
        this.clearList.addEventListener('click', this.clearListClicked.bind(this));
        //bind the additional event listener for clicking on a series title
    }

    deDupe(list) {
        let merged = [].concat.apply([], list);
        let result = [];
        $.each(merged, function(i, e) {
            if ($.inArray(e, result) === -1) result.push(e);
        });
        return result.sort();
    }

    render() {
        let arrayOfTags =[];
        $.each(this.data, ( key, value ) => {
            arrayOfTags.push(value.tags);
    }
    );
        let tagNames = this.deDupe(arrayOfTags) ;
        $.each(tagNames, function( index, value ) {
            $( ".tag-list" ).append( "<li class="  + value + "><span class='tag is-link'>"+value +"</span></li>" );
        });
    }

    tagListClicked(event) {
        console.log('tag list (or child) clicked', event);
        $(".clear-button").attr("disabled",false);
        let obj = this.data.filter(function (obj) { return obj.tags.includes(event.target.innerText)});
        $( ".matching-items-list li" ).remove();
        $( "#selectedTags" ).text(event.target.innerText);
        $("#tag-browser  li span").removeClass("active");
        $.each(obj, function( index, value ) {
            $(event.target).addClass("active");
            $( ".matching-items-list" ).append( "<li id="  + value.id + " style='background-image: url("+value.thumbnail+")'>"+value.title +"</li>" );
        });
        //check to see if it was a tag that was clicked and render
        //the list of series that have the matching tags
    }

    handleObjectRoutToElement(obj){
        $( ".selected-item .content img" ).attr('src', obj.thumbnail);
        $( ".selected-item .content p" ).text(obj.description);
        $( ".selected-item li  #ratings" ).text(obj.rating);
        $( ".selected-item li  #titleLang" ).text(obj.nativeLanguageTitle);
        $( ".selected-item li  #country" ).text(obj.sourceCountry);
        $( ".selected-item li  #type" ).text(obj.type);
        $( ".selected-item li  #episodes" ).text(obj.episodes);
        $(".matching-items-list li").removeClass("active");
    }

    titleListClicked(event) {
        console.log('title list (or child) clicked', event);
        let obj = this.data.find(function (obj) { return obj.id === parseInt($(event.target).attr('id')) });
        $( "#selectedTitle" ).text(event.target.innerText);
        this.handleObjectRoutToElement(obj);

        $(event.target).addClass("active");
    }
    clearListClicked(){
        $( ".matching-items-list li" ).remove();
        $("*").removeClass("active");
        $(".clear-button").attr("disabled",true);
        let  emptyObj ={
            "type": "",
            "rating": "",
            "episodes": "",
            "id": "",
            "tags": "",
            "sourceCountry": "",
            "description":
                "No Title chosen",
            "nativeLanguageTitle": "",
            "thumbnail":
                "http://via.placeholder.com/350x350"
        };
        this.handleObjectRoutToElement(emptyObj);
        $( "#selectedTags" ).text("Selected Tags");
        $( "#selectedTitle" ).text("Selected Series Title");

    }

}