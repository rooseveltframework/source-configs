/**
 * method to grab items from deploy configuration
 * @module deployConfig
 */
const data = require('./getDeployConfig').config

module.exports = {
  get: function (path) {
    if (data === null) return undefined

    let pointer = data

    const sections = path.split('.')

    let i = 0

    while (i < sections.length) {
      pointer = pointer[sections[i]]
      if (pointer === undefined) break
      i++
    }

    return pointer
  }
}
