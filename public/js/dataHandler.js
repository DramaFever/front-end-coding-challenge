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

export default {
  extractTags
}