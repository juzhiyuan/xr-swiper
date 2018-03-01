let lastTime = 0
export const requestAnimationFrame =
  global.requestAnimationFrame ||
  function (callback) {
    const currTime = Date.now()
    const timeDelay = Math.max(0, 16 - (currTime - lastTime))
    lastTime = currTime + timeDelay
    return global.setTimeout(() => {
      callback(Date.now())
    }, timeDelay)
  }

export function getResult(target) {
  if (typeof target === 'function') {
    return target()
  }
  return target
}
