import React from 'react'
import {requestAnimationFrame, getResult} from './utils'
import SwipeItemContainer from './SwipeItemContainer'

class Swiper extends React.Component {
  static defaultProps = {
    className: 'ReactSwiper',
    startIndex: 0,
    speed: 300,
    disableTouch: false,
    continuous: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      currentIndex: props.startIndex,
      containerWidth: 0,
    }
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.setState({
        containerWidth: this.container.offsetWidth,
      })
    })
    global.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.handleResize)
    this.destroy = true
  }

  handleResize = () => {
    this.setState({
      containerWidth: this.container.offsetWidth,
    })
  }

  handleSwipeCancel = () => {
    const {onSwipeEnd} = this.props

    if (onSwipeEnd) {
      onSwipeEnd(this.state.currentIndex)
    }
  }

  resetCurrent(current) {
    const {children, onChange, onSwipeEnd} = this.props
    if (current >= children.length) {
      current = 0
    } else if (current < 0) {
      current = children.length - 1
    }
    if (!this.destroy) {
      this.setState({
        currentIndex: current,
      })
    }
    if (onChange) {
      onChange(current)
    }
    if (onSwipeEnd) {
      onSwipeEnd(current)
    }
  }

  swipe = (increase) => {
    if (Math.abs(increase) > 1) {
      throw new Error('Do not call swipe directly')
    }
    const {continuous, children} = this.props
    const {containerWidth, currentIndex} = this.state

    if (!continuous) {
      if (
        (increase > 0 && currentIndex === children.length - 1) ||
        (increase < 0 && currentIndex === 0)
      ) {
        return Promise.resolve()
      }
    }

    const targetOffset = containerWidth * -increase

    return this
      .itemContainer.transformTo(targetOffset)
      .then(() => {
        this.resetCurrent(currentIndex + increase)
      })
  }

  swipeToNext = () => {
    const {onSwipeStart, disabled} = this.props

    if (getResult(disabled)) {
      return Promise.resolve()
    }

    if (onSwipeStart) {
      onSwipeStart()
    }

    return this.swipe(1)
  }

  swipeToPrev = () => {
    const {onSwipeStart, disabled} = this.props

    if (getResult(disabled)) {
      return Promise.resolve()
    }

    if (onSwipeStart) {
      onSwipeStart()
    }
    return this.swipe(-1)
  }

  renderItemContainer() {
    const {
      children, className, disableTouch, speed,
      continuous, onClose, onSwipeStart,
      disabled,
    } = this.props
    const {containerWidth, currentIndex} = this.state
    if (!containerWidth) {
      return null
    }

    const targetChildren = React.Children.toArray(children)
    if (continuous && targetChildren.length < 3) {
      if (targetChildren.length === 1) {
        Array.from({length: 2}).forEach(() => {
          targetChildren.push(React.cloneElement(targetChildren[0]))
        })
      } else if (targetChildren.lenght === 2) {
        targetChildren.push(React.cloneElement(targetChildren[0]))
        targetChildren.push(React.cloneElement(targetChildren[1]))
      }
    }

    return (
      <SwipeItemContainer
        className={`${className}-ItemContainer`}
        style={{
          width: `${containerWidth * targetChildren.length}px`,
        }}
        ref={el => { this.itemContainer = el }}
        disableTouch={disableTouch}
        disabled={disabled}
        speed={speed}
        triggerSwipe={this.swipe}
        disablePanRight={!continuous && currentIndex === targetChildren.length - 1}
        disablePanLeft={!continuous && currentIndex === 0}
        onSwipeStart={onSwipeStart}
        onSwipeCancel={this.handleSwipeCancel}
      >
        {React.Children.map(targetChildren, (item, index) => {
          let increase = index - currentIndex
          if (targetChildren.length > 2 && currentIndex === 0 && index === targetChildren.length - 1) {
            increase = -1
          } else if (targetChildren.length > 2 && currentIndex === targetChildren.length - 1 && index === 0) {
            increase = 1
          }

          return React.cloneElement(item, Object.assign({
            style: {
              transform: `translateX(${(increase) * containerWidth}px)`,
              left: `${-index * containerWidth}px`,
              width: `${containerWidth}px`,
            },
            className: [`${className}-Item`, item.props.className].filter(Boolean).join(' '),
          }, typeof item.type === 'function' && {
            isCurrent: currentIndex === index,
            onClose,
          }))
        })}
      </SwipeItemContainer>
    )
  }

  render() {
    const {className} = this.props
    return (
      <div
        className={className}
        ref={el => { this.container = el }}
      >
        {this.renderItemContainer()}
      </div>
    )
  }
}

export default Swiper
