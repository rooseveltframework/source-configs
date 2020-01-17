/**
 * method to grab items a from configuration object
 * @module getFromConfig
 */

module.exports = (data, path) => {
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
