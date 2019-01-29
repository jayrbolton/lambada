const { div, showIf } = require('../utils/h')

// A simple modal component with subtle enter/exit animations

function create (options = {}) {
  return Object.assign({
    open: false,
    closeable: true,
    width: 400,
    height: 400
  }, options)
}

const open = state => ev => state.update({ open: true })
const close = state => ev => state.update({ open: false })
const toggle = state => ev => state.update({ open: !state.open })

function view (state, { body }) {
  if (!state.open) return ''
  const [height, width] = [window.innerHeight, window.innerWidth]
  const offsetTop = height / 2 - state.height / 2
  return div({
    style: {
      position: 'fixed',
      zIndex: 3,
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      transition: 'background 0.25s',
      background: 'rgba(0,0,0,0)',
      delayed: { background: 'rgba(0,0,0,0.35)' },
      remove: { background: 'rgba(0,0,0,0)' }
    },
    on: {
      click: ev => {
        if (!state.closeable) return
        if (ev.target.dataset.modalInner) return
        close(state)()
      }
    }
  }, [
    div({
      dataset: { modalInner: true },
      style: {
        zIndex: 2,
        position: 'fixed',
        padding: '8px',
        borderRadius: '4px',
        background: 'white',
        top: (offsetTop - 40) + 'px',
        opacity: 0,
        delayed: { top: offsetTop + 'px', opacity: 1 },
        destroy: { opacity: 0, top: (offsetTop - 40) + 'px' },
        transition: 'top .25s, opacity .25s',
        left: (width / 2 - state.width / 2) + 'px',
        width: state.width + 'px',
        height: state.height + 'px'
      }
    }, [
      showIf(state.closeable, () =>
        div({
          on: { click: close(state) },
          style: {
            fontSize: '24px',
            cursor: 'pointer',
            position: 'absolute',
            top: '8px',
            right: '8px'
          }
        }, '✖')
      ),
      div(body)
    ])
  ])
}

module.exports = { create, view, open, close, toggle }
