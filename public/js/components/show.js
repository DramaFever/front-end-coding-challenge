export default class Show {
  constructor(config) {
    const {
      type,
      rating,
      episodes,
      sourceCountry,
      description,
      title,
      nativeLanguageTitle,
      thumbnail
    } = config;
    return $(
      `<div class="content">
              <h3 class="subtitle show__title">${title}</h3>
              <img class='show__img' src="${thumbnail}" />
              <p class='show__desc'>
              ${description}
              </p>
            </div>
            <ul class='show__details'>
              <li><strong>Rating:</strong> <span>${rating}</span></li>
              <li><strong>Native Language Title:</strong> <span>${nativeLanguageTitle}</span></li>
              <li><strong>Source Country:</strong> <span>${sourceCountry}</span></li>
              <li><strong>Type:</strong> <span>${type}</span></li>
              <li><strong>Episodes:</strong> <span>${episodes}</span></li>
            </ul>
          `
    )
  }
}
