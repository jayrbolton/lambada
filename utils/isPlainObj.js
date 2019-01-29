
module.exports = function isPlainObject (obj) {
  return obj && typeof obj === 'object' && obj.constructor === Object
}
