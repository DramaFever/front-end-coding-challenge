'use strict'

/**
 * Remove tags
 * @param {Object} array of items.
 * @return {Object} array of sorted, unique tags pulled from items.
 */
const extractTags = items => {
  let tags = []
  items.forEach(item => {
    tags = tags.concat(item.tags)
  })
  return tags.unique().sort(sortCaseInsensitive.bind(this, null))
}

// Filter by matching tags and sort by the title field.
const findByTag = (items, tag) => {
  return items.filter(item => item.tags.indexOf(tag) !== -1)
              .sort(sortCaseInsensitive.bind(this, 'title'))
}

const findById = (items, id) => {
  return items.filter(item => item.id === id)[0] || {}
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

export default {
  extractTags,
  findByTag,
  findById
}