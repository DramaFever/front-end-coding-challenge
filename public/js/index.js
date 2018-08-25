var getParentSpan = element => {
    while (element !== null && element.tagName) {
        if (element.tagName.toLowerCase() === "span") {
            return element;
        }
        element = element.parentNode;
    }
    return null;
};
var getParentListItem = element => {
    while (element !== null && element.tagName) {
        if (element.tagName.toLowerCase() === "li") {
            return element;
        }
        element = element.parentNode;
    }
    return null;
};

var removeActiveTags = () => {
    let targetItems = document.querySelectorAll('.active');
    targetItems.forEach(targetItem => {
        targetItem.classList.remove('active');
    });
}

var setMatchingItemActive = (matchingItemElement) => {
    removeActiveItemsListTags();
    matchingItemElement.classList.add("active")
}

var removeActiveItemsListTags = () => {
    let targetItems = document.querySelectorAll('.active');
    targetItems.forEach(targetItem => {
        if(targetItem.classList.length === 1) targetItem.classList.remove('active');
    });
}

$(".clear-button").click(function() {
    removeActiveTags();
    $('.subtitle:eq(1)').text('No Tag Selected');
    $('.subtitle:eq(2)').text('No Series Selected');
    $( ".matching-items-list" ).empty();
    $('.selected-item > div > img').attr("src", "http://via.placeholder.com/350x350");
    $('.selected-item > div > p').empty();
    $('.selected-item > ul').empty();
    document.querySelector('.clear-button').classList.add('is-disabled');
});