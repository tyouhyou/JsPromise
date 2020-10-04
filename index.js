// // FOR ES6 module --->
// import { JsPromise } from "./js_promise.js";
// let $p = JsPromise; // Promise / JsPromise
// export {
//     testPromise
// }
// // <---

// FOR NODEJS module --->
let JsPromise = require('./js_promise.js').JsPromise;
let $p = JsPromise; // Promise / JsPromise
testPromise();
// <---

function testPromise(isAlert) {
    let promise = new $p((resolve, reject) => {
        // setTimeout(() => resolve(1), 0);
        resolve(1);
        reject("Reject. I will be ignoerd if resolve has been called before me, or my turn if resolved in setTimeout.");
        showLog("I'll go first.", isAlert);
    });

    promise.then(result => {
        showLog("1st chained then; result=" + result, isAlert);                 // 1
        return result + 1;
    }).then(result => {
        return new $p((resolve, reject) => {
            showLog("2nd chained then. result=" + result, isAlert);             // 2
            setTimeout(() => {
                resolve(result + 1);
                // reject("I rejected.")
            });
        });
    }).then(result => {
        setTimeout(() => {
            showLog("3rd chained then. result=" + result, isAlert);             // 3
        }, 0);
        return result + 1;
    }).catch(reason => {
        showLog("error occurred. " + reason, isAlert);
        return "catched";
    }).finally(() => {
        showLog("finally.", isAlert);
        return 100;                                                             // ignored
    }).then(result => {
        showLog("chained then after finally. result=" + result, isAlert);       // 4
        return result + 1;
    }).catch(reason => {
        showLog("catch after finally. reason=" + reason, isAlert);
    });

    promise.then(result => {
        showLog("1st seperated then. result=" + result, isAlert);               // 1
        return result + 1;                                                      // not chained, no effect
    });

    promise.then(result => {
        showLog("2nd seperated then. result=" + result, isAlert);               // 1
        return result + 1;                                                      // not chained, no effect
    });
}

function showLog(msg, isAlert) {
    if (isAlert) {
        alert(msg);
    } else {
        console.log(msg);
    }
}
