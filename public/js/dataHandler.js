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
  return tags.unique().sort()
}

const findByTag = (items, tag) => {
  return items.filter(item => item.tags.indexOf(tag) !== -1)
              .sort((a,b) => a.title > b.title)
}

export default {
  extractTags,
  findByTag
}