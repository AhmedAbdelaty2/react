/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

describe('SyntheticWheelEvent', () => {
  var React;
  var ReactDOM;
  var createMouseEvent;

  beforeEach(() => {
    React = require('react');
    ReactDOM = require('react-dom');
  });

  it('should normalize properties from the Event interface', () => {
    const container = document.createElement('div');
    const events = [];
    var onWheel = event => {
      event.persist();
      events.push(event);
    };
    const component = ReactDOM.render(<div onWheel={onWheel} />, container);
    document.body.appendChild(container);

    const node = ReactDOM.findDOMNode(component);

    const event = new MouseEvent('wheel', {
      bubbles: true,
    });
    // Emulate IE8
    Object.defineProperty(event, 'target', {
      get() {},
    });
    Object.defineProperty(event, 'srcElement', {
      get() {
        return node;
      },
    });
    node.dispatchEvent(event);

    expect(events.length).toBe(1);
    expect(events[0].target).toBe(node);
    expect(events[0].type).toBe('wheel');

    document.body.removeChild(container);
  });

  it('should normalize properties from the MouseEvent interface', () => {
    const container = document.createElement('div');
    const events = [];
    var onWheel = event => {
      event.persist();
      events.push(event);
    };
    const component = ReactDOM.render(<div onWheel={onWheel} />, container);
    document.body.appendChild(container);

    const node = ReactDOM.findDOMNode(component);

    node.dispatchEvent(
      new MouseEvent('wheel', {
        bubbles: true,
        button: 1,
      }),
    );

    expect(events.length).toBe(1);
    expect(events[0].button).toBe(1);

    document.body.removeChild(container);
  });

  it('should normalize properties from the WheelEvent interface', () => {
    var events = [];
    const container = document.createElement('div');
    var onWheel = event => {
      event.persist();
      events.push(event);
    };
    const component = ReactDOM.render(<div onWheel={onWheel} />, container);
    document.body.appendChild(container);

    const node = ReactDOM.findDOMNode(component);

    var event = new MouseEvent('wheel', {
      bubbles: true,
    });
    // jsdom doesn't support these so we add them manually.
    Object.assign(event, {
      deltaX: 10,
      deltaY: -50,
    });
    node.dispatchEvent(event);

    expect(events[0].deltaX).toBe(10);
    expect(events[0].deltaY).toBe(-50);

    event = new MouseEvent('wheel', {
      bubbles: true,
    });
    // jsdom doesn't support these so we add them manually.
    Object.assign(event, {
      wheelDeltaX: -10,
      wheelDeltaY: 50,
    });
    node.dispatchEvent(event);

    expect(events[1].deltaX).toBe(10);
    expect(events[1].deltaY).toBe(-50);

    document.body.removeChild(container);
  });

  it('should be able to `preventDefault` and `stopPropagation`', () => {
    var events = [];
    const container = document.createElement('div');
    var onWheel = event => {
      event.persist();
      events.push(event);
    };
    const component = ReactDOM.render(<div onWheel={onWheel} />, container);
    document.body.appendChild(container);

    const node = ReactDOM.findDOMNode(component);

    node.dispatchEvent(
      new MouseEvent('wheel', {
        bubbles: true,
        deltaX: 10,
        deltaY: -50,
      }),
    );
    expect(events[0].isDefaultPrevented()).toBe(false);
    events[0].preventDefault();
    expect(events[0].isDefaultPrevented()).toBe(true);

    node.dispatchEvent(
      new MouseEvent('wheel', {
        bubbles: true,
        deltaX: 10,
        deltaY: -50,
      }),
    );
    expect(events[1].isPropagationStopped()).toBe(false);
    events[1].stopPropagation();
    expect(events[1].isPropagationStopped()).toBe(true);

    document.body.removeChild(container);
  });

  it('should be able to `persist`', () => {
    var events = [];
    const container = document.createElement('div');
    var onWheel = event => {
      events.push(event);
    };
    const component = ReactDOM.render(<div onWheel={onWheel} />, container);
    document.body.appendChild(container);

    const node = ReactDOM.findDOMNode(component);

    node.dispatchEvent(
      new MouseEvent('wheel', {
        bubbles: true,
      }),
    );
    expect(events[0].isPersistent()).toBe(false);
    events[0].persist();
    expect(events[0].isPersistent()).toBe(true);

    document.body.removeChild(container);
  });
});
