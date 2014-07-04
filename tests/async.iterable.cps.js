﻿var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('async.iterable.cps(...)', function () {
    var foo = async.iterable.cps(function (count, accum) {
        if (count < 1 || count > 9)
            throw new Error('out of range');
        for (var i = 1; i <= count; ++i) {
            if (accum)
                accum.push(111 * i);
            yield_(111 * i);
        }
        return 'done';
    });

    describe('returns a function', function () {
        it('which returns an async iterator with next() and forEach() methods', function () {
            var syncResult = foo();
            expect(syncResult).is.an('object');
            expect(syncResult.next).is.a('function');
            expect(syncResult.forEach).is.a('function');
        });
    });

    describe('provides an iterator whose next() method', function () {
        it('synchronously returns nothing', function () {
            var iter = foo(3);
            expect(iter.next()).to.not.exist;
        });

        it('executes its definition asynchronously', function (done) {
            var arr = [], iter = foo(3, arr), next = Promise.promisify(iter.next, iter);
            next().then(function (result) {
                return expect(arr).to.deep.equal([111]);
            }).then(function () {
                return done();
            }).catch(done);
            expect(arr).to.be.empty;
        });

        it("preserves the 'this' context of the call", async.cps(function () {
            var foo = { bar: async.iterable.cps(function () {
                    yield_(this);
                    return 'done';
                }) }, baz = { x: 7 };
            var iter = foo.bar(), next = Promise.promisify(iter.next, iter);
            expect(await(next())).to.deep.equal({ done: false, value: foo });
            expect(await(next())).to.deep.equal({ done: true, value: 'done' });
            iter = foo.bar.call(baz), next = Promise.promisify(iter.next, iter);
            expect(await(next())).to.deep.equal({ done: false, value: baz });
            expect(await(next())).to.deep.equal({ done: true, value: 'done' });
        }));

        it('eventually resolves with the definition\'s yielded value', async.cps(function () {
            var iter = foo(3), next = Promise.promisify(iter.next, iter);
            expect(await(next())).to.deep.equal({ done: false, value: 111 });
            expect(await(next())).to.deep.equal({ done: false, value: 222 });
            expect(await(next())).to.deep.equal({ done: false, value: 333 });
            expect(await(next())).to.deep.equal({ done: true, value: 'done' });
        }));

        it('eventually rejects with the definition\'s thrown value', async.cps(function () {
            var err, iter = foo(20), next = Promise.promisify(iter.next, iter);
            expect(function () {
                return await(next());
            }).to.throw(Error, 'out of range');
        }));

        it('eventually rejects if the iteration is already finished', async.cps(function () {
            var err, iter = foo(1), next = Promise.promisify(iter.next, iter);
            expect(await(next())).to.deep.equal({ done: false, value: 111 });
            expect(await(next())).to.deep.equal({ done: true, value: 'done' });
            expect(function () {
                return await(next());
            }).to.throw(Error);
        }));
    });

    describe('provides an iterator whose forEach() method', function () {
        function nullFunc() {
        }

        it('expects a single callback as its argument', function () {
            expect(function () {
                return foo(3).forEach();
            }).to.throw(Error);
            expect(function () {
                return foo(3).forEach(1);
            }).to.throw(Error);
            expect(function () {
                return foo(3).forEach(1, nullFunc);
            }).to.throw(Error);
        });

        it('synchronously returns nothing', function () {
            var iter = foo(3);
            expect(iter.forEach(nullFunc)).to.not.exist;
        });

        it('executes its definition asynchronously', function (done) {
            var arr = [], iter = foo(3, arr), forEach = Promise.promisify(iter.forEach, iter);
            forEach(nullFunc).then(function (result) {
                return expect(arr).to.deep.equal([111, 222, 333]);
            }).then(function () {
                return done();
            }).catch(done);
            expect(arr).to.be.empty;
        });

        it('iterates over all yielded values', async.cps(function () {
            var arr = [], iter = foo(4), forEach = Promise.promisify(iter.forEach, iter);
            await(forEach(function (val) {
                return arr.push(val);
            }));
            expect(arr).to.deep.equal([111, 222, 333, 444]);
        }));

        it('eventually resolves with the definition\'s returned value', async.cps(function () {
            var arr = [], iter = foo(7, arr), forEach = Promise.promisify(iter.forEach, iter);
            var result = await(forEach(nullFunc));
            expect(result).to.equal('done');
            expect(arr.length).to.equal(7);
        }));

        it('eventually rejects with the definition\'s thrown value', async.cps(function () {
            var err, iter = foo(20), forEach = Promise.promisify(iter.forEach, iter);
            expect(function () {
                return await(forEach(nullFunc));
            }).to.throw(Error, 'out of range');
        }));

        it('eventually rejects if the iteration is already finished', async.cps(function () {
            var err, iter = foo(1), forEach = Promise.promisify(iter.forEach, iter);
            await(forEach(nullFunc));
            expect(function () {
                return await(forEach(nullFunc));
            }).to.throw(Error);
        }));
    });
});
//# sourceMappingURL=async.iterable.cps.js.map