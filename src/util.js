export const uniqArray = (array, identifier = v => v) => {
  if (array.length === 0) return [];
  let length = array.length;
  var result = [];
  var seen = new Set();

  for (let index = 0; index < length; index++) {
    let value = array[index];
    let theId = identifier(value);
    if (seen.has(theId)) continue;
    seen.add(theId);
    result.push(value);
  }
  return result;
};
