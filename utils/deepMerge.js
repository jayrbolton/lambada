const isPlainObj = require('./isPlainObj')

// Mutates obj1
function deepMerge (obj1, obj2) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    throw new Error('deep merge must be called on two objects')
  }
  for (let key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (isPlainObj(obj1[key]) && isPlainObj(obj2[key])) {
        deepMerge(obj1[key], obj2[key])
      } else {
        obj1[key] = obj2[key]
      }
    }
  }
  return obj1
}

module.exports = deepMerge
