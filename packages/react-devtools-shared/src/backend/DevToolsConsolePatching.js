/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// This is a DevTools fork of shared/ConsolePatchingDev.
// The shared console patching code is DEV-only.
// We can't use it since DevTools only ships production builds.

// Helpers to patch console.logs to avoid logging during side-effect free
// replaying on render function. This currently only patches the object
// lazily which won't cover if the log function was extracted eagerly.
// We could also eagerly patch the method.

let disabledDepth = 0;
let prevLog;
let prevInfo;
let prevWarn;
let prevError;
let prevGroup;
let prevGroupCollapsed;
let prevGroupEnd;
let patched;

function disabledLog() {}
disabledLog.__reactDisabledLog = true;

export function disableLogs(): void {
  if (disabledDepth === 0) {
    // In some environment, properties on console is not writable, even not configurable.
    /* eslint-disable-next-line react-internal/no-production-logging */
    const desc = Object.getOwnPropertyDescriptors(console);
    prevLog = desc.log;
    prevInfo = desc.info;
    prevWarn = desc.warn;
    prevError = desc.error;
    prevGroup = desc.group;
    prevGroupCollapsed = desc.groupCollapsed;
    prevGroupEnd = desc.groupEnd;
    const disabledDesc = {
      configurable: true,
      enumerable: true,
      value: disabledLog,
      writable: true,
    };
    configure('log', disabledDesc);
    configure('info', disabledDesc);
    configure('warn', disabledDesc);
    configure('error', disabledDesc);
    configure('group', disabledDesc);
    configure('groupCollapsed', disabledDesc);
    configure('groupEnd', disabledDesc);
    patched = true;
  }
  disabledDepth++;
}

export function reenableLogs(): void {
  disabledDepth--;
  if (disabledDepth === 0 && patched) {
    configure('log', prevLog);
    configure('info', prevInfo);
    configure('warn', prevWarn);
    configure('error', prevError);
    configure('group', prevGroup);
    configure('groupCollapsed', prevGroupCollapsed);
    configure('groupEnd', prevGroupEnd);
    patched = false;
  }
  if (disabledDepth < 0) {
    console.error(
      'disabledDepth fell below zero. ' +
        'This is a bug in React. Please file an issue.',
    );
  }
}

function configure(name: string, descriptor: PropertyDescriptor<any>) {
  if (!descriptor || !descriptor.configurable) return;
  try {
    // $FlowFixMe Flow thinks console is immutable.
    /* eslint-disable-next-line react-internal/no-production-logging */
    Object.defineProperty(console, name, descriptor);
  } catch {}
}
