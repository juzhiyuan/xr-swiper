const isBrowser = typeof document !== 'undefined'

if (isBrowser) {
  module.exports = require('hammerjs')
} else {
  module.exports = function () {}
}
