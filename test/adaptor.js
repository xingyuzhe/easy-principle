var promisesAplusTests = require("promises-aplus-tests");
var PromiseA = require('../src/promise').PromiseA;

var adapter = {
    resolve: function () {
      PromiseA.resolve(arguments[0]);
    },
    reject: function () {
      PromiseA.reject(arguments[0]);
    },
    deferred: function () {
        var resolve, reject;
        var promise = new PromiseA(function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;
        });
        return {
            promise: promise,
            resolve: resolve,
            reject: reject
        };  
    }
}

promisesAplusTests(adapter, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    console.error(err);
});
