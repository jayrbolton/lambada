const snabbdom = require('snabbdom')

const patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/attributes').default
])

class State {
  constructor (data, view) {
    if (view) this._view = view
    this._fullPath = []
    /*
    const reserved = ['update', 'scope', '_top', '_render']
    reserved.forEach(prop => {
      Object.defineProperty(this, prop, { configurable: false, writable: false })
    })
    */
    for (let key in data) this[key] = data[key]
    return this
  }
  update (obj) {
    for (let key in obj) this[key] = obj[key]
    this.render()
    return this
  }
  scope (path) {
    const substate = getPath(path, this)
    if (substate.update && substate.scope) {
      // The path may change, so we update it here
      substate._fullPath = this._fullPath.concat(path)
      return substate
    }
    const top = this._top || this
    const scopedState = new State(substate)
    const fullPath = this._fullPath.concat(path)
    scopedState._top = top
    scopedState._fullPath = fullPath
    setPath(fullPath, top, scopedState)
    return scopedState
  }
  render () {
    if (this._top) return this._top.render()
    // Do the patch in 10ms batches to prevent repeated re-renders when
    // .update() is called many times in a row
    const later = () => {
      this.timeout = null
      this._vnode = patch(this._vnode, this._view(this))
    }
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(later, 10)
  }
}

// Get a sub-object of an object according to a path like ['x', 'y', 0]
// Can also get indexes of arrays
function getPath (path, obj) {
  return path.reduce((obj, p) => obj[p], obj)
}

// Set a value at a path in the object
function setPath (path, obj, toSet) {
  const lastPath = path[path.length - 1]
  const val = getPath(path.slice(0, path.length - 1), obj)
  val[lastPath] = toSet
}

// Initialize a state object from some data, render the view, and return a plain dom node
function render (view, data) {
  const state = new State(data, view)
  state._vnode = patch(document.createElement('div'), view(state))
  return state._vnode.elm
}

module.exports = render
