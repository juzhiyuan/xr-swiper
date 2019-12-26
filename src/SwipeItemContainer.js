import React from 'react'
import Hammer from './hammer'
import {requestAnimationFrame, getResult} from './utils'
import store from './store'

export default class SwipeItemContainer extends React.Component {
  static threshold = 30

  componentDidMount() {
    const {onRef, disableTouch} = this.props

    if (onRef) {
      onRef(this.node)
    }

    if (!disableTouch) {
      this.bindPanEvent()
    }
  }

  componentWillUnmount() {
    if (!this.props.disableTouch && this.mc) {
      this.mc.off('pan', this.handlePan)
    }
  }

  bindPanEvent() {
    const mc = new Hammer.Manager(this.node)
    mc.add(new Hammer.Pan({direction: Hammer.DIRECTION_HORIZONTAL}))
    mc.on('pan', this.handlePan)
    this.mc = mc
  }

  resetSwiping() {
    const {onSwipeCancel} = this.props
    this.transformTo(0)
    store.swiping = false
    if (onSwipeCancel) {
      onSwipeCancel()
    }
  }

  handlePan = (e) => {
    const {onSwipeStart, disabled} = this.props
    if (getResult(disabled)) { return }

    if (store.disableSwipe) { return }
    const move = e.deltaX

    if (e.center.x === 0 && e.center.y === 0 && e.distance > 100) {
      this.resetSwiping()
      return // hammer bug ?
    }

    const {triggerSwipe, disablePanRight, disablePanLeft} = this.props

    if ((disablePanLeft && move > 0) ||
        (disablePanRight && move < 0)) {
      return
    }

    if (onSwipeStart && !store.swiping) {
      onSwipeStart()
    }
    store.swiping = true
    this.node.style.transform = `translateX(${move}px)`

    if (e.isFinal) {
      if (Math.abs(move) > SwipeItemContainer.threshold) {
        triggerSwipe(move > 0 ? -1 : 1).then(() => { store.swiping = false })
      } else {
        this.resetSwiping()
      }
    }
  }

  transformTo = (target) => {
    const {speed} = this.props
    this.node.style.transition = `transform ease-in-out ${speed / 1000}s`
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        if (this.node) {
          this.node.style.transform = `translateX(${target}px)`
        }

        setTimeout(() => {
          if (this.node) {
            this.node.style.transition = null
            this.node.style.transform = null
          }
          resolve()
        }, speed)
      })
    })
  }

  render() {
    const {className, style, children} = this.props

    return (
      <div
        className={className}
        ref={el => { this.node = el }}
        style={style}
      >
        {children}
      </div>
    )
  }
}
