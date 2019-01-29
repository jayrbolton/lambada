const h = require('snabbdom/h').default

const tags = ['div', 'p', 'button', 'form', 'input', 'textarea', 'select', 'option', 'b', 'i', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'footer', 'main', 'article', 'ul', 'ol', 'li', 'a', 'article', 'audio', 'blockquote', 'br', 'canvas', 'code', 'dd', 'dl', 'dt', 'fieldset', 'head', 'header', 'body', 'img', 'nav', 'pre', 'table', 'thead', 'th', 'tr', 'tbody', 'tr', 'template', 'time', 'hr']

tags.forEach(tag => {
  module.exports[tag] = h.bind(null, tag)
})

// Return an empty string if bool is falsy
// Otherwise, return the vnode (or the result if it's a function)
module.exports.showIf = function showIf (bool, vnode) {
  if (!bool) return ''
  if (typeof vnode === 'function') return vnode()
  return vnode
}
