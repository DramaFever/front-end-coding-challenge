function tagsMarkup(tags) {
  let html = ''
  tags.forEach((tag, index) => {
    html += tagMarkup(tag, index)
  })
  return html
}

function tagMarkup(tag, index) {
  return `<li>
    <span class="tag is-link ${index === 0 ? 'active' : ''}">
      ${tag}
    </span>
  </li>`
}

export default { tagsMarkup }