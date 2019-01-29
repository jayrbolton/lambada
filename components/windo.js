const { div } = require('../utils/h')
const btn = require('./btn')

// Width in pixels of the resizer bars on the edges
const RESIZE_WIDTH = 12

// Handle window move and drag actions
// We have to handle this on the document because the cursor can move faster than the elem being dragged/resized
document.addEventListener('mousemove', function (ev) {
  if (document._draggingWindow) {
    const state = document._draggingWindow
    const ydiff = ev.clientY - state.mouseY
    const xdiff = ev.clientX - state.mouseX
    state.update({
      mouseX: ev.clientX,
      mouseY: ev.clientY,
      xpos: state.xpos + xdiff,
      ypos: state.ypos + ydiff
    })
  }
  if (document._resizingWindow) {
    const state = document._resizingWindow
    const updates = { mouseX: ev.clientX, mouseY: ev.clientY }
    // We are resizing horizontally
    if (state.resizeWidth) {
      const xdiff = ev.clientX - state.mouseX
      // We are resizing from the left, so we need to move the window left
      if (state.moveLeft) {
        // We are resizing from the left, so we need to move the window left
        state.xpos = state.xpos + xdiff
        // xdiff will be negative as the cursor moves left.
        updates.width = state.width - xdiff
      } else {
        // We are resizing from the right, so expand the width to the right
        updates.width = state.width + xdiff
      }
    }
    // We are resizing vertically
    if (state.resizeHeight) {
      const ydiff = ev.clientY - state.mouseY
      if (state.moveTop) {
        // We are resizing from the top, so we need to move the window up
        updates.ypos = state.ypos + ydiff
        // ydiff will be negative, as the mouse is moving up, so we invert the sign
        updates.height = state.height - ydiff
      } else {
        // We are resizing from the bottom, so expand the height downwards
        updates.height = state.height + ydiff
      }
    }
    state.update(updates)
  }
})

// Stop dragging or resizing on mouseup
document.addEventListener('mouseup', function (ev) {
  if (document._draggingWindow) {
    document._draggingWindow.update({ dragging: false })
    document._draggingWindow = null
  }
  if (document._resizingWindow) {
    document._resizingWindow.update({ resizing: false })
    document._resizingWindow = null
  }
})

// Stop dragging or resizing if the cursor leaves the window
document.addEventListener('mouseout', function (ev) {
  if (ev.relatedTarget === null && ev.toElement === null) {
    if (document._draggingWindow) {
      document._draggingWindow.update({ dragging: false })
      document._draggingWindow = null
    }
    if (document._resizingWindow) {
      document._resizingWindow.update({ resizing: false })
      document._resizingWindow = null
    }
  }
})

// Create a new window state
function create (opts) {
  const winheight = window.innerHeight
  const winwidth = window.innerWidth
  const state = Object.assign({
    zIndex: 1,
    open: false,
    resizable: true,
    movable: true,
    width: 400,
    height: 400,
    ypos: winheight / 2 - 400 / 2,
    xpos: winwidth / 2 - 400 / 2
  }, opts)
  return state
}

// State updater actions
const close = state => ev => state.update({ open: false })
const open = state => ev => state.update({ open: true })
const toggle = state => ev => state.update({ open: !state.open })

// Top-level view function for the window component
function view (state, { title, body, allWindos }) {
  if (!state.open) return ''
  // open the window initially at the cursor position instead?
  return div({
    style: {
      zIndex: state.zIndex,
      position: 'fixed',
      background: 'white',
      overflow: 'hidden',
      padding: RESIZE_WIDTH + 'px',
      top: state.ypos + 'px',
      left: state.xpos + 'px',
      width: state.width + 'px',
      height: state.height + 'px',
      border: '2px solid #ddd',
      boxShadow: '5px 5px 5px 0px rgba(140,140,140,1)'
    },
    on: { mousedown: bringToTop(state, allWindos) }
  }, [
    div({
      style: {
        background: '#f8f8f8',
        position: 'relative',
        padding: '12px 0',
        cursor: 'move',
        userSelect: 'none'
      },
      on: {
        mousedown: ev => {
          document._draggingWindow = state
          state.update({ mouseY: ev.clientY, mouseX: ev.clientX, dragging: true })
        }
      }
    }, [ div({ style: { textAlign: 'center' } }, title) ]),
    btn({
      on: { click: close(state) },
      style: {
        position: 'absolute',
        margin: '0px',
        right: (RESIZE_WIDTH + 6) + 'px',
        top: (RESIZE_WIDTH + 6) + 'px',
        background: 'white'
      }
    }, '✖'),
    div({ style: { padding: '12px' } }, body),
    // Right resize bar
    div({
      on: { mousedown: startResizing(state, { resizeWidth: true }) },
      style: {
        width: RESIZE_WIDTH + 'px',
        height: (state.height - RESIZE_WIDTH * 2) + 'px',
        position: 'absolute',
        top: RESIZE_WIDTH + 'px',
        right: '0px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'e-resize'
      }
    }),
    // Left resize bar
    div({
      on: { mousedown: startResizing(state, { resizeWidth: true, moveLeft: true }) },
      style: {
        width: RESIZE_WIDTH + 'px',
        height: (state.height - RESIZE_WIDTH * 2) + 'px',
        position: 'absolute',
        left: '0px',
        top: RESIZE_WIDTH + 'px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'w-resize'
      }
    }),
    // Top resize bar
    div({
      on: { mousedown: startResizing(state, { resizeHeight: true, moveTop: true }) },
      style: {
        position: 'absolute',
        top: '0px',
        left: RESIZE_WIDTH + 'px',
        height: RESIZE_WIDTH + 'px',
        width: (state.width - RESIZE_WIDTH * 2) + 'px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'n-resize'
      }
    }),
    // Bottom resize bar
    div({
      on: { mousedown: startResizing(state, { resizeHeight: true }) },
      style: {
        position: 'absolute',
        bottom: '0px',
        left: RESIZE_WIDTH + 'px',
        height: RESIZE_WIDTH + 'px',
        width: (state.width - RESIZE_WIDTH * 2) + 'px',
        cursor: 's-resize',
        border: '1px solid purple',
        background: 'pink'
      }
    }),
    // Top right corner resize square
    div({
      on: { mousedown: startResizing(state, { resizeHeight: true, moveTop: true, resizeWidth: true }) },
      style: {
        position: 'absolute',
        top: '0px',
        right: '0px',
        width: RESIZE_WIDTH + 'px',
        height: RESIZE_WIDTH + 'px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'ne-resize'
      }
    }),
    // Top left corner resize square
    div({
      on: { mousedown: startResizing(state, { resizeHeight: true, resizeWidth: true, moveTop: true, moveLeft: true }) },
      style: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: RESIZE_WIDTH + 'px',
        height: RESIZE_WIDTH + 'px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'nw-resize'
      }
    }),
    // Bottom left corner resize square
    div({
      on: { mousedown: startResizing(state, { resizeHeight: true, resizeWidth: true, moveLeft: true }) },
      style: {
        position: 'absolute',
        bottom: '0px',
        left: '0px',
        width: RESIZE_WIDTH + 'px',
        height: RESIZE_WIDTH + 'px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'sw-resize'
      }
    }),
    // Bottom right corner resize square
    div({
      on: { mousedown: startResizing(state, { resizeHeight: true, resizeWidth: true }) },
      style: {
        position: 'absolute',
        bottom: '0px',
        right: '0px',
        width: RESIZE_WIDTH + 'px',
        height: RESIZE_WIDTH + 'px',
        background: 'pink',
        border: '1px solid purple',
        cursor: 'se-resize'
      }
    })
  ])
}

// Event handler for mousedown-ing on a window to bring it above the others
const bringToTop = (state, allWindos) => ev => {
  if (state.zIndex === 2) return
  allWindos.forEach(w => w.update({ zIndex: 1 }))
  state.update({ zIndex: 2 })
}

// Event handler for when we start resizing the window
const startResizing = (state, { resizeWidth, resizeHeight, moveLeft, moveTop }) => ev => {
  document._resizingWindow = state
  state.update({
    mouseY: ev.clientY,
    mouseX: ev.clientX,
    resizing: true,
    resizeWidth,
    resizeHeight,
    moveLeft,
    moveTop
  })
}

module.exports = { create, view, open, close, toggle }
