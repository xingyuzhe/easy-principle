/**
 * 要缓存结果并保证有序
 * 达到并发上限时中断循环, 当某个任务结束时触发循环保证继续
 * 当某个任务失败时中断循环
 * 由于要记录任务触发顺序并和异步结果一一对应, 下面多用了一个startted变量来记录顺序, 用running变量做并发判断,用finished做结束判断
 */

Promise.queue = function (promises, concurrent) {
  if (!Array.isArray(promises)) throw new TypeError(`Promise.queue: param one must be an array`)
  return new Promise((resolve, reject) => {
    let startted = 0, finished = 0, error, running = 0

    const res = []
    const total = promises.length

    function resolver(index) {
      return function (data) {
        finished++
        running--
        res[index] = data
        if (finished === total) {
          resolve(res)
        } else {
          process()
        }
      }
    }

    function process() {
      while (promises.length && running < concurrent) {
        if (error) {
          break
        }
        running++
        promises.shift()().then(resolver(startted++)).catch(reason => {
          error = reason
          reject(error)
        })
      }
    }

    process()
  })
}

function createPromsie(resolve, reject) {
  return function () {
    return new Promise(resolve, reject)
  }
}

; (function () {
  console.time('hello1');
  const p1 = createPromsie((resolve) => setTimeout(() => resolve(1), 150));
  const p2 = createPromsie((resolve) => setTimeout(() => resolve(2), 200));
  const p3 = createPromsie((resolve) => setTimeout(() => resolve(3), 100));

  Promise.queue([p1, p2, p3], 1)
    .then((results) => {
      console.timeEnd('hello1');
      console.log(results); // [1, 2, 3]
    });
})();

; (function () {
  console.time('hello2');
  const p1 = createPromsie((resolve) => setTimeout(() => resolve(1), 150));
  const p2 = createPromsie((resolve) => setTimeout(() => resolve(2), 200));
  const p3 = createPromsie((resolve) => setTimeout(() => resolve(3), 100));

  Promise.queue([p1, p2, p3], 2)
    .then((results) => {
      console.timeEnd('hello2');
      console.log(results); // [1, 2, 3]
    });
})();

; (function () {
  console.time('hello3');
  const p1 = createPromsie((resolve) => setTimeout(() => resolve(1), 150));
  const p2 = createPromsie((resolve) => setTimeout(() => resolve(2), 200));
  const p3 = createPromsie((resolve) => setTimeout(() => resolve(3), 100));

  Promise.queue([p1, p2, p3], 3)
    .then((results) => {
      console.timeEnd('hello3');
      console.log(results); // [1, 2, 3]
    });
})();

; (function () {
  const p1 = Promise.resolve(1);
  const p2 = Promise.reject(2);
  const p3 = Promise.resolve(3);

  Promise.all([p1, p2, p3])
    .then((results) => {
      console.log(results);
    }).catch((e) => {
      console.log(e); // 2
    });
})();

