function spit() {
  let sum = 0
  return function f(num) {
    f.sum = ~~f.sum + num
    return f
  }
}

const spitter = spit()

console.log(spitter(1)(2)(3).sum)
