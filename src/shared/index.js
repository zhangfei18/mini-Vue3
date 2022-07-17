export const extend = Object.assign;
export const isObject = (val) => {
  return val !== null && typeof val === 'object';
}
export const hasChanged = function (value, newValue){
  return !Object.is(value, newValue);
};

export const hasOwn = function(target, key){
  return Object.prototype.hasOwnProperty.call(target, key);
}