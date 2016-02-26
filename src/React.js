/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule React
 */

'use strict';

const ReactDOM = require('ReactDOM');
const ReactDOMServer = require('ReactDOMServer');
const ReactIsomorphic = require('ReactIsomorphic');

const assign = require('Object.assign');

// `version` will be added here by ReactIsomorphic.
const React = {};

assign(React, ReactIsomorphic);

React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactDOM;
React.__SECRET_DOM_SERVER_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactDOMServer;

module.exports = React;
