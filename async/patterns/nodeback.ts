﻿import references = require('references');
import _ = require('lodash');
import Coro = require('../coro');
export = NodebackCoro;


class NodebackCoro extends Coro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        //TODO: allow callback to be omitted if arity is known (need option for this?)
        this.callback = args.pop();
        if (!_.isFunction(this.callback)) throw new Error('Expected final argument to be a callback');
        super.invoke(func, this_, args);
        setImmediate(() => super.resume());
    }

    return(result) {
        this.callback(null, result);
    }

    throw(error) {
        this.callback(error);
    }

    static arityFor(func: Function) {
        return func.length + 1;
    }

    private callback: Function;
}