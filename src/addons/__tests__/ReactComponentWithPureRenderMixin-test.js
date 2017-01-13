/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
 */

'use strict';

import React from 'React';
import ReactComponentWithPureRenderMixin from 'ReactComponentWithPureRenderMixin';
import ReactTestUtils from 'ReactTestUtils';

describe('ReactComponentWithPureRenderMixin', () => {

  it('provides a default shouldComponentUpdate implementation', () => {
    let renderCalls = 0;
    class PlasticWrap extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = {
          color: 'green',
        };
      }

      render() {
        return (
          <Apple
            color={this.state.color}
            ref="apple"
          />
        );
      }
    }

    const Apple = React.createClass({
      mixins: [ReactComponentWithPureRenderMixin],

      getInitialState: function() {
        return {
          cut: false,
          slices: 1,
        };
      },

      cut: function() {
        this.setState({
          cut: true,
          slices: 10,
        });
      },

      eatSlice: function() {
        this.setState({
          slices: this.state.slices - 1,
        });
      },

      render: function() {
        renderCalls++;
        return <div />;
      },
    });

    const instance = ReactTestUtils.renderIntoDocument(<PlasticWrap />);
    expect(renderCalls).toBe(1);

    // Do not re-render based on props
    instance.setState({color: 'green'});
    expect(renderCalls).toBe(1);

    // Re-render based on props
    instance.setState({color: 'red'});
    expect(renderCalls).toBe(2);

    // Re-render base on state
    instance.refs.apple.cut();
    expect(renderCalls).toBe(3);

    // No re-render based on state
    instance.refs.apple.cut();
    expect(renderCalls).toBe(3);

    // Re-render based on state again
    instance.refs.apple.eatSlice();
    expect(renderCalls).toBe(4);
  });

  it('does not do a deep comparison', () => {
    function getInitialState() {
      return {
        foo: [1, 2, 3],
        bar: {a: 4, b: 5, c: 6},
      };
    }

    let renderCalls = 0;
    const initialSettings = getInitialState();

    const Component = React.createClass({
      mixins: [ReactComponentWithPureRenderMixin],

      getInitialState: function() {
        return initialSettings;
      },

      render: function() {
        renderCalls++;
        return <div />;
      },
    });

    const instance = ReactTestUtils.renderIntoDocument(<Component />);
    expect(renderCalls).toBe(1);

    // Do not re-render if state is equal
    const settings = {
      foo: initialSettings.foo,
      bar: initialSettings.bar,
    };
    instance.setState(settings);
    expect(renderCalls).toBe(1);

    // Re-render because one field changed
    initialSettings.foo = [1, 2, 3];
    instance.setState(initialSettings);
    expect(renderCalls).toBe(2);

    // Re-render because the object changed
    instance.setState(getInitialState());
    expect(renderCalls).toBe(3);
  });

});
