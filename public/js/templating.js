'use strict'

const generateTagsMarkup = tags => {
  return elementRepeater(tags, tagMarkup)
}

const generateTitlesMarkup = titles => {
  return elementRepeater(titles, titleMarkup)
}

const elementRepeater = (items, renderMethod) => {
  let html = ''
  items.forEach((item, index) => {
    html += renderMethod(item, index)
  })
  return html
}

// Individual elements.
const tagMarkup = (tag, index) => {
  return `<li>
    <span class="tag is-link ${index === 0 ? 'active' : ''}">
      ${tag}
    </span>
  </li>`
}
const titleMarkup = (title, index) => {
  return `<li class="${index === 0 ? 'active': ''}">${title}</li>`
}

export default {
  generateTagsMarkup,
  generateTitlesMarkup
}