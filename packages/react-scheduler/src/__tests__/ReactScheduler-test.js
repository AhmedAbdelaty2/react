/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let ReactScheduler;
let ReactFeatureFlags;

describe('ReactScheduler', () => {
  beforeEach(() => {
    // TODO pull this into helper method, reduce repetition.
    // mock the browser APIs which are used in react-scheduler:
    // - requestAnimationFrame should pass the DOMHighResTimeStamp argument
    // - calling 'window.postMessage' should actually fire postmessage handlers
    global.requestAnimationFrame = function(cb) {
      return setTimeout(() => {
        cb(Date.now());
      });
    };
    const originalAddEventListener = global.addEventListener;
    let postMessageCallback;
    global.addEventListener = function(eventName, callback, useCapture) {
      if (eventName === 'message') {
        postMessageCallback = callback;
      } else {
        originalAddEventListener(eventName, callback, useCapture);
      }
    };
    global.postMessage = function(messageKey, targetOrigin) {
      const postMessageEvent = {source: window, data: messageKey};
      if (postMessageCallback) {
        postMessageCallback(postMessageEvent);
      }
    };
    jest.resetModules();
    ReactScheduler = require('react-scheduler');
  });

  describe('rIC', () => {
    it('calls the callback within the frame when not blocked', () => {
      const {rIC} = ReactScheduler;
      const cb = jest.fn();
      rIC(cb);
      jest.runAllTimers();
      expect(cb.mock.calls.length).toBe(1);
      // should not have timed out and should include a timeRemaining method
      expect(cb.mock.calls[0][0].didTimeout).toBe(false);
      expect(typeof cb.mock.calls[0][0].timeRemaining()).toBe('number');
    });

    describe('with multiple callbacks', () => {
      beforeEach(() => {
        jest.resetModules();

        ReactFeatureFlags = require('shared/ReactFeatureFlags');
        ReactFeatureFlags.scheduleModuleSupportsMultipleCallbacks = true;

        ReactScheduler = require('react-scheduler');
      });

      it('accepts multiple callbacks and calls within frame when not blocked', () => {
        const {rIC} = ReactScheduler;
        const callbackLog = [];
        const callbackA = jest.fn(() => callbackLog.push('A'));
        const callbackB = jest.fn(() => callbackLog.push('B'));
        rIC(callbackA);
        // initially waits to call the callback
        expect(callbackLog).toEqual([]);
        // waits while second callback is passed
        rIC(callbackB);
        expect(callbackLog).toEqual([]);
        // after a delay, calls as many callbacks as it has time for
        jest.runAllTimers();
        expect(callbackLog).toEqual(['A', 'B']);
        // callbackA should not have timed out and should include a timeRemaining method
        expect(callbackA.mock.calls[0][0].didTimeout).toBe(false);
        expect(typeof callbackA.mock.calls[0][0].timeRemaining()).toBe(
          'number',
        );
        // callbackA should not have timed out and should include a timeRemaining method
        expect(callbackB.mock.calls[0][0].didTimeout).toBe(false);
        expect(typeof callbackB.mock.calls[0][0].timeRemaining()).toBe(
          'number',
        );
      });

      it(
        'schedules callbacks in correct order and' +
          'keeps calling them if there is time',
        () => {
          const {rIC} = ReactScheduler;
          const callbackLog = [];
          const callbackA = jest.fn(() => {
            callbackLog.push('A');
            rIC(callbackC);
          });
          const callbackB = jest.fn(() => {
            callbackLog.push('B');
          });
          const callbackC = jest.fn(() => {
            callbackLog.push('C');
          });

          rIC(callbackA);
          // initially waits to call the callback
          expect(callbackLog).toEqual([]);
          // continues waiting while B is scheduled
          rIC(callbackB);
          expect(callbackLog).toEqual([]);
          // after a delay, calls the scheduled callbacks,
          // and also calls new callbacks scheduled by current callbacks
          jest.runAllTimers();
          expect(callbackLog).toEqual(['A', 'B', 'C']);
        },
      );

      it('schedules callbacks in correct order when callbacks have many nested rIC calls', () => {
        const {rIC} = ReactScheduler;
        const callbackLog = [];
        const callbackA = jest.fn(() => {
          callbackLog.push('A');
          rIC(callbackC);
          rIC(callbackD);
        });
        const callbackB = jest.fn(() => {
          callbackLog.push('B');
          rIC(callbackE);
          rIC(callbackF);
        });
        const callbackC = jest.fn(() => {
          callbackLog.push('C');
        });
        const callbackD = jest.fn(() => {
          callbackLog.push('D');
        });
        const callbackE = jest.fn(() => {
          callbackLog.push('E');
        });
        const callbackF = jest.fn(() => {
          callbackLog.push('F');
        });

        rIC(callbackA);
        rIC(callbackB);
        // initially waits to call the callback
        expect(callbackLog).toEqual([]);
        // while flushing callbacks, calls as many as it has time for
        jest.runAllTimers();
        expect(callbackLog).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      });

      it('schedules callbacks in correct order when they use rIC to schedule themselves', () => {
        const {rIC} = ReactScheduler;
        const callbackLog = [];
        let callbackAIterations = 0;
        const callbackA = jest.fn(() => {
          if (callbackAIterations < 1) {
            rIC(callbackA);
          }
          callbackLog.push('A' + callbackAIterations);
          callbackAIterations++;
        });
        const callbackB = jest.fn(() => callbackLog.push('B'));

        rIC(callbackA);
        // initially waits to call the callback
        expect(callbackLog).toEqual([]);
        rIC(callbackB);
        expect(callbackLog).toEqual([]);
        // after a delay, calls the latest callback passed
        jest.runAllTimers();
        expect(callbackLog).toEqual(['A0', 'B', 'A1']);
      });
    });
  });

  describe('cIC', () => {
    it('cancels the scheduled callback', () => {
      const {rIC, cIC} = ReactScheduler;
      const cb = jest.fn();
      const callbackId = rIC(cb);
      expect(cb.mock.calls.length).toBe(0);
      cIC(callbackId);
      jest.runAllTimers();
      expect(cb.mock.calls.length).toBe(0);
    });

    describe('with multiple callbacks', () => {
      beforeEach(() => {
        jest.resetModules();

        ReactFeatureFlags = require('shared/ReactFeatureFlags');
        ReactFeatureFlags.scheduleModuleSupportsMultipleCallbacks = true;

        ReactScheduler = require('react-scheduler');
      });

      it('when one callback cancels the next one', () => {
        const {rIC, cIC} = ReactScheduler;
        const callbackLog = [];
        let callbackBId;
        const callbackA = jest.fn(() => {
          callbackLog.push('A');
          cIC(callbackBId);
        });
        const callbackB = jest.fn(() => callbackLog.push('B'));
        rIC(callbackA);
        callbackBId = rIC(callbackB);
        // Initially doesn't call anything
        expect(callbackLog).toEqual([]);
        jest.runAllTimers();
        // B should not get called because A cancelled B
        expect(callbackLog).toEqual(['A']);
        expect(callbackB.mock.calls.length).toBe(0);
      });
    });
  });

  // TODO: test now
});
