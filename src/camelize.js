function camelize(label) {
  if (!label.length) return label
  if (typeof label !== 'string') return label

  const words = label.split(/[_-]/)

  const firstWord = words.shift()

  if (!words.length && firstWord[0].toLowerCase() === firstWord[0]) return label

  let result = firstWord.toLowerCase()

  for (let word of words) {
    result += word[0].toUpperCase() + word.slice(1)
  }

  return result
}

camelize.prepend = function(prefix, label) {
  label = camelize(label)
  return prefix.toLowerCase() + label[0].toUpperCase() + label.slice(1)
}
