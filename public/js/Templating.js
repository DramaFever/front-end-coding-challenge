'use strict'

const defaultVals = {
  title: 'No Series Selected',
  thumbnail: 'http://via.placeholder.com/350x350',
}

const generateSeriesMarkup = series => {
  if (!series) {
    series = defaultVals
  }

  return `
    <div class="content">
      <h3 class="subtitle">${series.title}</h3>
      <img src="${series.thumbnail}" />
      <p>
        ${series.description || ''}
      </p>
    </div>
    <ul>
      <li><strong>Rating:</strong> <span>${series.rating || ''}</span></li>
      <li><strong>Native Language Title:</strong> <span>${series.nativeLanguageTitle || ''}</span></li>
      <li><strong>Source Country:</strong> <span>${series.sourceCountry || ''}</span></li>
      <li><strong>Type:</strong> <span>${series.type || ''}</span></li>
      <li><strong>Episodes:</strong> <span>${series.episodes || ''}</span></li>
    </ul>`
}

const generateTagsMarkup = tags => {
  return elementRepeater(tags, tagMarkup)
}

const generateTitlesMarkup = titles => {
  return elementRepeater(titles, titleMarkup)
}

// Generators.
// This whole 'passing a callback' was supposed to have more of a purpose.
const elementRepeater = (items, renderMethod) => {
  let html = ''
  items.forEach((item, index) => {
    html += renderMethod(item, index)
  })
  return html
}

// Individual elements for tags and series lists.
const tagMarkup = (tag, index) => {
  return `
    <li>
      <span class="tag is-link">
        ${tag}
      </span>
    </li>
  `
}
const titleMarkup = (item, index) => {
  return `
    <li class="${item.index === 0 ? 'active': ''}">
        <a data-title="${item.title}" data-id="${item.id}" class="tag is-link">${item.title}</a>
    </li>
  `
}

export default {
  generateSeriesMarkup,
  generateTagsMarkup,
  generateTitlesMarkup
}