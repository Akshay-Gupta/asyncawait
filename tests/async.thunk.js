﻿var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('A suspendable function returned by async.thunk(...)', function () {
    it('synchronously returns a thunk', function () {
        var foo = async.thunk(function () {
        });
        var syncResult = foo();
        expect(syncResult).instanceOf(Function);
        expect(syncResult.length).to.equal(1);
    });

    it('does not execute if the thunk is not invoked', function (done) {
        var x = 5;
        var foo = async.thunk(function () {
            x = 7;
        });
        var thunk = foo();
        Promise.delay(50).then(function () {
            return expect(x).to.equal(5);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it('executes if the thunk is invoked without a callback', function (done) {
        var x = 5;
        var foo = async.thunk(function () {
            x = 7;
        });
        foo()();
        Promise.delay(20).then(function (result) {
            return expect(x).to.equal(7);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it('executes its definition asynchronously', function (done) {
        var x = 5;
        var foo = async.thunk(function () {
            x = 7;
        });
        Promise.promisify(foo())().then(function (result) {
            return expect(x).to.equal(7);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it("preserves the 'this' context of the call", function (done) {
        //TODO: broken test, fix me
        var foo = { bar: async.thunk(function () {
                return this;
            }) }, baz = { x: 7 };
        Promise.promisify(foo.bar.call(foo))().then(function (result) {
            return expect(result).to.equal(foo);
        }).then(function () {
            return Promise.promisify(foo.bar.call(baz))();
        }).then(function (result) {
            return expect(result).to.equal(baz);
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('eventually resolves with its definition\'s returned value', function (done) {
        var foo = async.thunk(function () {
            return 'blah';
        });
        Promise.promisify(foo())().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('eventually rejects with its definition\'s thrown value', function (done) {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async.thunk(function () {
            throw exp;
            return 'blah';
        });
        Promise.promisify(foo())().catch(function (err) {
            return act = err;
        }).then(function () {
            if (!act)
                done(new Error("Expected function to throw"));
            else if (act.message !== exp.message)
                done(exp);
            else
                done();
        });
    });

    it('ignores yielded values', function (done) {
        var foo = async.thunk(function () {
            yield_(111);
            yield_(222);
            yield_(333);
            return 444;
        });
        var yields = [];
        Promise.promisify(foo())().progressed(function (value) {
            return yields.push(value);
        }).then(function (result) {
            return expect(result).to.equal(444);
        }).then(function () {
            return expect(yields).to.deep.equal([]);
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=async.thunk.js.map