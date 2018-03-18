export default class Tag {
  constructor(config) {
    const {name, id, className, onClick} = config;
    const elem = $(`<li>
        <span        
        class='${className} is-link' data-name="${id}">
          ${name}
         </span>
        </li>`);

    elem.on('click', onClick);
    return elem
  }
}
