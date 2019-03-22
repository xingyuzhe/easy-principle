const State = {
  pending: Symbol('PromiseA:pending'),
  fullfilled: Symbol('PromiseA:fullfilled'),
  rejected: Symbol('PromiseA:rejected')
}

class PromiseA {
  constructor(executor) {
    if (!(this instanceof PromiseA)) {
      throw Error(`${this.constructor.name}: constructor can not be called without new`)
    }

    if (typeof executor !== 'function') {
      throw Error(`${this.constructor.name}: first argument must be a function`)
    }

    this._state = State.pending
    this._value = undefined
    this._callbacks = []
    executor(this._transition.bind(this, State.fullfilled), this._transition.bind(this, State.rejected))
    return this
  }

  // 2.1.1 When pending, a promise:may transition to either the fulfilled or rejected state.
  // 2.1.2 When fulfilled, a promise: must not transition to any other state. must have a value, which must not change.
  // 2.1.3 When rejected, a promise:must not transition to any other state.must have a reason, which must not change.
  _transition(newState, value) {
    if (this._state === State.pending) {
      this._state = newState
      this._value = value

      this._callbacks.forEach(fn => fn())
    }
  }

  then(onFulfilled, onRejected) {
    // 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code
    
    // 2.2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
    // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value

    // 2.2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.
    // 2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.
    onRejected = isFunction(onRejected) ? onRejected : err => { throw err }

    const newPromise = new PromiseA((resolve, reject) => {
      // 2.2.6 then may be called multiple times on the same promise.
      // 2.2.6.1 If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
      // 2.2.6.2 If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.

      const scheduleFn = () => {
        setTimeout(() => {
          try {
            const newResult = this._state === State.fullfilled ? onFulfilled(this._value) : onRejected(this._value)
            resolvePromise({ newPromise, resolve, reject }, newResult)
          } catch(e) {
            reject(e)
          }
        }, 0)
      }

      if (this._state === State.pending) {
        this._callbacks.push(scheduleFn)
      } else {
        scheduleFn()
      }
    })

    return newPromise
  }

  catch(onRejected) {
    this.then(undefined, onRejected)
  }

  static resolve(newResult) {
    return new PromiseA(resolve => resolvePromise({ resolve, reject: resolve }, newResult))
  }

  static resolve(newResult) {
    return new PromiseA((resolve, reject) => resolvePromise({ resolve: reject, reject }, newResult))
  }

  static race() {}

  static all() {}
}

function isFunction(func) {
  return typeof func === 'function'
}

function isObjectLike(obj) {
  return (obj !== null && typeof obj === 'object') || typeof obj === 'function'
}

function resolvePromise({ newPromise, resolve, reject }, x) {
  // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (newPromise === x) {
    reject(new TypeError('Chaining cycle detected for promise'))
    return
  }

  // 2.3.2 If x is a promise, adopt its state
  if (x instanceof PromiseA) {
    x.then(value => resolvePromise({ resolve, reject, newPromise }, value), reason => reject(reason))
    return
  }

  // 2.3.4 If x is not an object or function, fulfill promise with x.
  if (!isObjectLike(x)) {
    resolve(x)
    return
  }

  // 2.3.3.4 If then is not a function, fulfill promise with x.
  if (!isFunction(x.then)) {
    resolve(x)
    return
  }

  let resolvedOrRejected = false

  try {
    // 2.3.3.1 Let then be x.then
    const then = x.then

    // 2.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
    // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
    then.call(x, value => {
      if (!resolvedOrRejected) {
        // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
        resolvePromise({ resolve, reject, newPromise }, value)
        resolvedOrRejected = true
      }
    }, reason => {
      // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
      if (!resolvedOrRejected) {
        reject(reason)
        resolvedOrRejected = true
      }
    })
  } catch(e) {
    if (resolvedOrRejected) return
    // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
    // 2.3.3.4 If calling then throws an exception e
    reject(e)
  }
}

exports.PromiseA = PromiseA
