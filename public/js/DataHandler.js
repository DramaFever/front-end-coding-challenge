'use strict'

export default class DataHandler {
  constructor(data) {
    this.data = data || {}
  }

  // Retrieve sorted unique tags.
  extractTags() {
    let tags = []
    this.data.forEach(item => {
      tags = tags.concat(item.tags)
    })
    return tags.filter(arrayUniques).sort(sortCaseInsensitive.bind(this, null))
  }

  // Filter by matching tags and sort by the title field.  
  findByTag(tag) {
    return this.data.filter(item => item.tags.indexOf(tag) !== -1)
                    .sort(sortCaseInsensitive.bind(this, 'title'))
  }

  // Filter by series ID.
  findById(id) {
    return this.data.filter(item => item.id === id)[0] || {}
  }
}

// Sorting/filter functions.
// Sorts strings or objects by key.
const sortCaseInsensitive = (key, item1, item2) => {
  let a = key ? item1[key].toLowerCase() : item1.toLowerCase()
  let b = key ? item2[key].toLowerCase() : item2.toLowerCase()
  if (a === b) {
    return 0
  }

  return a.toLowerCase() > b.toLowerCase() ? 1 : -1
}

const arrayUniques = (val, i, self) => {
    return self.indexOf(val) === i
}
