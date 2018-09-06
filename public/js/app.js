export default class TagBrowserWidget {

    // Define the program flow on construction
    constructor(config) {
	this.config = config;
	
	//use .bind because native promises change the "this" context
	this.fetchData() // AJAX the json blob
	    .then(this.setData.bind(this))            // bind the data received from the promise
	    .then(this.getElements.bind(this))        // define dom elements for rendering
	    .then(this.bindEventListeners.bind(this)) // bind event listeners for interaction
	    .then(this.render.bind(this));            // render the list of accumulated tags
	
	console.log('Widget Instance Created');
    }
    

    // Load the data.json file over AJAX and return a Promise
    fetchData() {
	return new Promise((resolve, reject) => {
	    //ajax the data and resolve the promise when it comes back
	    $.get('/js/data.json', resolve);
	});
    }
    

    // Store data after the data is fetched over AJAX
    setData(data) {
	this.data = data; // bind the json data to the class

	// use an array to store all unique tags
	// loop through allloaded jsobjs and check for uniqueness
	var uniqueTags = [];

	// look at the tag data and check if the tag exists in the list
	this.data.forEach(function(jsonobj) {
	    jsonobj.tags.forEach(function(tag) {
		// lower case all the tags for consistency
		var lowerTag = tag.toLowerCase();

		// check if tag is in array using indexOf
		// append to the unique tags if not
		if (uniqueTags.indexOf(lowerTag) < 0) {
		    uniqueTags.push(lowerTag);
		}
	    });
	});

	// sort the tags then bind it to our class
	uniqueTags.sort();
	this.uniqueTags = uniqueTags;
    }
    

    // Create and bind query selectors to the local object
    getElements() {
	this.tagList = this.config.element.querySelector('#tag-list');

	// get all the subtitles for rendering
	this.selectedTagHeader = this.config.element.querySelector("#selected-tag-header");
	this.selectedTitleHeader = this.config.element.querySelector("#selected-title-header");
	this.matchingTitlesList = this.config.element.querySelector("#matching-items-list");
	
	// clear button
	this.clearButton = this.config.element.querySelector(".clear-button");
	
	// title detail elements
	this.titleImage = this.config.element.querySelector("#selected-image");
	this.titleDesc = this.config.element.querySelector("#title-description");
	this.titleRating = this.config.element.querySelector("#title-rating");
	this.titleLanguage = this.config.element.querySelector("#title-language");
	this.titleCountry = this.config.element.querySelector("#title-country");
	this.titleType = this.config.element.querySelector("#title-type");
	this.titleEpCount = this.config.element.querySelector("#title-episodes-count");
    }
    

    // Bind event listeners to interactive elements on the page
    bindEventListeners() {
	// bind an event when you click on the tag list
	this.tagList.addEventListener('click', this.tagListClicked.bind(this));

	// bind an event when you click on the filtered titles
	this.matchingTitlesList.addEventListener('click', this.titleListClicked.bind(this));

	// bind an event when you click on the Clear button
	this.clearButton.addEventListener('click', this.clearButtonClick.bind(this));
    }
    

    // Render all our unique tags on the page
    render() {
	// empty the tag list
	this.tagList.innerHTML = "";

	// use a builder string var to start building up a tag list
	var builder = "";
	this.uniqueTags.forEach(function(tag){
	    builder +=  "<li><span class='tag is-link'>" + tag + "</span></li>";
	});

	// assign the tag list to the element
	this.tagList.innerHTML = builder;

	// start out with nothing selected (as if we clicked the Clear button)
	this.clearButtonClick();
    }
    

    // Event for when a tag in the tag list is clicked
    // Will filter through titles with a matching tag
    // if none is found, display zero results
    tagListClicked(event) {
	// console.log('tag list (or child) clicked', event);

	// check if what we clicked on was actually a tag
	if(!event.target.classList.contains("tag")) {
	    this.emptyTitleList(); // clear the matching titles list
	    return;
	}

	// extract the tag text
	var targetTag = event.target.innerHTML;

	// remove the active class from other tags
	this.config.element.querySelectorAll(".tag").forEach(function(tag) {
	    tag.classList.remove("active");
	});
	
	// add the active class to the clicked tag 
	event.target.classList.add("active");

	// re-enable the clear button when a tag is clicked
	this.clearButton.style.display = "block";

	// set the tag name to the header
	this.selectedTagHeader.innerHTML = "[" + targetTag.toUpperCase() + "]"; 

	// iterate through all titles and filter ones wth matching tags
	var filteredTitles = [];
	this.data.forEach(function(jsonobj) {
	    // check if our target tag exists in the current selected json obj
	    if (jsonobj.tags.indexOf(targetTag) != -1) {
		filteredTitles.push(jsonobj);
	    }
	});

	// no titles matched the tag selected
	if (filteredTitles.length == 0) {
	    this.emptyTitlesList();
	    return;
	}

	// sort the objects using name first, then ID if names are equivalent
	// use greater than to sort ascending
	filteredTitles.sort(function(a, b) {
	    if (a.title === b.title) {
		return a.id > b.id;
	    }
	    return a.title > b.title;
	});


	// build a list of matching titles
	var builder = "";
	filteredTitles.forEach(function(jsonobj){
	    builder += "<li class='title-item' data-id='" + jsonobj.id + "'>" + jsonobj.title + "</li>";
	});
	this.matchingTitlesList.innerHTML = builder;
    }


    // Event for when a title in the title list was clicked
    // Fills all the data in based on the title JSON blob into the feature section
    titleListClicked(event) {
	// check if what we clicked on was actually a tag
	if(!event.target.classList.contains("title-item")) {
	    this.emptyTitleDetails(); // clear both the title list and the details
	    return;
	}

	// extract both the title and the title's id
	var targetTitle = event.target.innerHTML;
	var targetID = event.target.dataset.id;

	// remove the active class from other titles (same as tags)
	this.config.element.querySelectorAll(".title-item").forEach(function(tag) {
	    tag.classList.remove("active");
	});
	
	// add the active class to the clicked tag 
	event.target.classList.add("active");

	// grab the json obj
	var filter = this.data.filter(function(obj){ return obj.id == targetID; });
	if(filter.length == 0) {
	    this.emptyTitleDetails();
	    return;
	}

	// there should only be one element from the filter
	var datum = filter[0];

	// pass the json object off to the details function
	this.fillTitleDetails(datum);
    }


    // given a JSON blob, fill out the selected title details
    fillTitleDetails(jsobj) {
	this.selectedTitleHeader.innerHTML = "[" + jsobj.title.toUpperCase() + "]";
	this.titleImage.src = jsobj.thumbnail;
	this.titleDesc.innerHTML = jsobj.description;
	this.titleLanguage.innerHTML = jsobj.nativeLanguageTitle;
	this.titleEpCount.innerHTML = jsobj.episodes;
	this.titleRating.innerHTML = jsobj.rating;
	this.titleType.innerHTML = jsobj.type;
    }


    // empty the tag list when no tag is clicked on
    emptyTitleList() {
	this.selectedTagHeader.innerHTML = "No Tag Selected";
	this.matchingTitlesList.innerHTML = "";
    }

    // empty the title details when no title is clicked on
    emptyTitleDetails() {
	this.selectedTitleHeader.innerHTML = "No Series Selected";
	this.titleImage.src = "http://via.placeholder.com/350x350";
	this.titleDesc.innerHTML = "";
	this.titleLanguage.innerHTML = "";
	this.titleEpCount.innerHTML = "";
	this.titleRating.innerHTML = "";
	this.titleType.innerHTML = "";
    }


    // clear both the title list and details when this button is clicked
    // when the button is clicked, the button itself should be disabled
    clearButtonClick() {
	this.emptyTitleList();
	this.emptyTitleDetails();
	this.clearButton.style.display = "none"; // disable the button
    }
}
