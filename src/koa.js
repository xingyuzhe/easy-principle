const http = require('http')

class Koa {
  constructor() {
    this.middlewares = []
    return this
  }

  compose() {
    const middlewares = this.middlewares
    return function composeResult(ctx) {
      function dispatch(i) {
        const currentMidware = middlewares[i]
        try {
          return Promise.resolve(
            currentMidware ? currentMidware(ctx, dispatch.bind(null, i + 1)) : 1
          )
        } catch (err) {
          return Promise.reject(err)
        }
      }
  
      return dispatch(0)
    }
  }

  use(fn) {
    this.middlewares.push(fn)
    return this
  }

  callback() {
    const promiseChain = this.compose()
    return (req, res) => {
      const ctx = { req, res }
      return promiseChain(ctx)
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}


const app = new Koa()

async function mid1(ctx, next) {
  console.log('start')
  await next()
  console.log('end')
}

async function mid2(ctx, next) {
  console.log('1')
  await next()
  console.log('2')
}

async function mid3(ctx, next) {
  console.log('one')
  await next()
  console.log('two')
  ctx.res.end('----')
}

app.use(mid1)
app.use(mid2)
app.use(mid3)

app.listen(9000)
