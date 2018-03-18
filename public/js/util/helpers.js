export function sortByDirection(arr, order){
  const sortFunc = (order === 'asc') ? (a, b) => {
    // debugger;
    return a - b} : (a, b) => a + b;
  return arr.sort(sortFunc);
}

export function bindAll(context, funcArr){
  for (const func of funcArr){
    context[func] = context[func].bind(context);
  }
}
