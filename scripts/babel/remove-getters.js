/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

module.exports = ({types: t}) => {
  return {
    visitor: {
      ObjectMethod: path => {
        // Turns this code:
        //
        // get prop() {
        //   return variable;
        // }
        //
        // into this:
        //
        // prop: variable;
        if (path.node.kind !== 'get') {
          return;
        }

        const keyNode = path.node.key;
        const isValidKey = t.isIdentifier(keyNode);
        if (!isValidKey) {
          return;
          /*
            Similar to Rollup.legacy behaviour.
            Not all getters code usage can be transformed in meaningful way.
            Simply return and don't throw error.

            This code based contains getters which can't be transformed but is guarded by using a try catch block.

            e.g. getters which has a side effect.

            var passiveBrowserEventsSupported = false;
            try {
              var options = {
                  get passive() {
                    passiveBrowserEventsSupported = true;
                  },
              };
            } catch(err) {
              passiveBrowserEventsSupported = false;
            }
          */
        }

        const bodyNode = path.node.body;
        const isValidBody =
          bodyNode.body.length === 1 &&
          t.isReturnStatement(bodyNode.body[0]) &&
          t.isIdentifier(bodyNode.body[0].argument);
        if (!isValidBody) {
          /*
            Similar to Rollup.legacy behaviour.
            Not all getters code usage can be transformed in meaningful way.
            Simply return and don't throw error.
          */
          return;
        }

        const prop = keyNode.name;
        const variable = bodyNode.body[0].argument.name;

        path.replaceWith(
          t.objectProperty(t.identifier(prop), t.identifier(variable))
        );
      },
    },
  };
};
