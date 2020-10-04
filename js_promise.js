class JsPromise {
    static State = Object.freeze({
        "pending": 0,
        "fulfilled": 1,
        "rejected": 2
    })

    constructor(executor) {
        this._state = JsPromise.State.pending;
        this._result;
        this._tasks = [];

        executor(
            value => this._settle(JsPromise.State.fulfilled, value),
            reason => this._settle(JsPromise.State.rejected, reason)
        );
    }

    _settle(state, result) {
        if (JsPromise.State.pending != this._state) return;

        this._state = state;
        this._result = result;
        setTimeout(() => {
            while (this._tasks.length > 0) {
                this._tasks.shift()(this._result);
            }
        }, 0);
    }

    _handleResultedPromise(prom, resolve, reject) {
        let me = this;
        if (JsPromise.State.pending === prom._state) {
            setTimeout(() => me._handleResultedPromise(prom, resolve, reject), 0);
        }

        switch (prom._state) {
            case JsPromise.State.fulfilled:
                resolve(prom._result);
                break;
            case JsPromise.State.rejected:
                reject(prom._result);
                break;
            default:
                break;
        }
    }

    _then(onResolve, onReject, onFinally) {
        let me = this;
        return new JsPromise((resolve, reject) => {
            me._tasks.push((value) => {
                switch (me._state) {
                    case JsPromise.State.fulfilled:
                        if (!!onResolve) {
                            let rst = onResolve(value);
                            if (rst instanceof JsPromise) {
                                me._handleResultedPromise(rst, resolve, reject);
                                return;
                            } else {
                                resolve(rst);
                            }
                        } else {
                            if (!!onFinally) {
                                onFinally();
                            }
                            resolve(value);
                        }
                        break;
                    case JsPromise.State.rejected:
                        if (!!onReject) {
                            let rst = onReject(value);
                            if (rst instanceof JsPromise) {
                                me._handleResultedPromise(rst, resolve, reject);
                                return;
                            } else {
                                reject(rst);
                            }
                        } else {
                            if (!!onFinally) {
                                onFinally();
                            }
                            reject(value);
                        }
                        break;
                    default:
                        break;
                }
            });
        });
    }

    then(onResolve, onReject) {
        return this._then(onResolve, onReject);
    }

    catch(onReject) {
        return this._then(null, onReject);
    }

    finally(finalTask) {
        return this._then(null, null, finalTask);
    }
}

// // FOR ES6 module --->
// export {
//     JsPromise
// }
// // <---

// FOR NODEJS module --->
module.exports = {
    JsPromise
}
// <---
