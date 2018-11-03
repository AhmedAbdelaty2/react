/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {ReactContext} from 'shared/ReactTypes';

import ErrorStackParser from 'error-stack-parser';
import ReactSharedInternals from 'shared/ReactSharedInternals';

const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;

// Used to track hooks called during a render

type HookLogEntry = {
  primitive: string,
  stackError: Error,
  value: mixed,
};

let hookLog: Array<HookLogEntry> = [];

// Primitives

type BasicStateAction<S> = (S => S) | S;

type Dispatch<A> = A => void;

let primitiveStackCache: null | Map<string, Array<any>> = null;

function getPrimitiveStackCache(): Map<string, Array<any>> {
  // This initializes a cache of all primitive hooks so that the top
  // most stack frames added by calling the primitive hook can be removed.
  if (primitiveStackCache === null) {
    let cache = new Map();
    let readHookLog;
    try {
      // Use all hooks here to add them to the hook log.
      Dispatcher.useContext(({_currentValue: null}: any));
      Dispatcher.useState(null);
      Dispatcher.useReducer((s, a) => s, null);
      Dispatcher.useRef(null);
      Dispatcher.useMutationEffect(() => {});
      Dispatcher.useLayoutEffect(() => {});
      Dispatcher.useEffect(() => {});
      Dispatcher.useImperativeMethods(undefined, () => null);
      Dispatcher.useCallback(() => {});
      Dispatcher.useMemo(() => null);
    } finally {
      readHookLog = hookLog;
      hookLog = [];
    }
    for (let i = 0; i < readHookLog.length; i++) {
      let hook = readHookLog[i];
      cache.set(hook.primitive, ErrorStackParser.parse(hook.stackError));
    }
    primitiveStackCache = cache;
  }
  return primitiveStackCache;
}

function readContext<T>(
  context: ReactContext<T>,
  observedBits: void | number | boolean,
): T {
  // For now we don't expose readContext usage in the hooks debugging info.
  return context._currentValue;
}

function useContext<T>(
  context: ReactContext<T>,
  observedBits: void | number | boolean,
): T {
  hookLog.push({
    primitive: 'Context',
    stackError: new Error(),
    value: context._currentValue,
  });
  return context._currentValue;
}

function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  let state: S =
    typeof initialState === 'function' ? initialState() : initialState;
  hookLog.push({primitive: 'State', stackError: new Error(), value: state});
  return [state, (action: BasicStateAction<S>) => {}];
}

function useReducer<S, A>(
  reducer: (S, A) => S,
  initialState: S,
  initialAction: A | void | null,
): [S, Dispatch<A>] {
  hookLog.push({
    primitive: 'Reducer',
    stackError: new Error(),
    value: initialState,
  });
  return [initialState, (action: A) => {}];
}

function useRef<T>(initialValue: T): {current: T} {
  hookLog.push({
    primitive: 'Ref',
    stackError: new Error(),
    value: initialValue,
  });
  return {current: initialValue};
}

function useMutationEffect(
  create: () => mixed,
  inputs: Array<mixed> | void | null,
): void {
  hookLog.push({
    primitive: 'MutationEffect',
    stackError: new Error(),
    value: create,
  });
}

function useLayoutEffect(
  create: () => mixed,
  inputs: Array<mixed> | void | null,
): void {
  hookLog.push({
    primitive: 'LayoutEffect',
    stackError: new Error(),
    value: create,
  });
}

function useEffect(
  create: () => mixed,
  inputs: Array<mixed> | void | null,
): void {
  hookLog.push({primitive: 'Effect', stackError: new Error(), value: create});
}

function useImperativeMethods<T>(
  ref: {current: T | null} | ((inst: T | null) => mixed) | null | void,
  create: () => T,
  inputs: Array<mixed> | void | null,
): void {
  hookLog.push({
    primitive: 'ImperativeMethods',
    stackError: new Error(),
    value: create(),
  });
}

function useCallback<T>(callback: T, inputs: Array<mixed> | void | null): T {
  hookLog.push({
    primitive: 'Callback',
    stackError: new Error(),
    value: callback,
  });
  return callback;
}

function useMemo<T>(
  nextCreate: () => T,
  inputs: Array<mixed> | void | null,
): T {
  let value = nextCreate();
  hookLog.push({primitive: 'Memo', stackError: new Error(), value});
  return value;
}

const Dispatcher = {
  readContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeMethods,
  useLayoutEffect,
  useMemo,
  useMutationEffect,
  useReducer,
  useRef,
  useState,
};

// Inspect

type HooksNode = {
  name: string,
  value: mixed,
  subHooks: Array<HooksNode>,
};
type HooksTree = Array<HooksNode>;

// Don't assume
//
// We can't assume that stack frames are nth steps away from anything.
// E.g. we can't assume that the root call shares all frames with the stack
// of a hook call. A simple way to demonstrate this is wrapping `new Error()`
// in a wrapper constructor like a polyfill. That'll add an extra frame.
// Similar things can happen with the call to the dispatcher. The top frame
// may not be the primitive. Likewise the primitive can have fewer stack frames
// such as when a call to useState got inlined to use dispatcher.useState.
//
// We also can't assume that the last frame of the root call is the same
// frame as the last frame of the hook call because long stack traces can be
// truncated to a stack trace limit.

let mostLikelyAncestorIndex = 0;

function findSharedIndex(hookStack, rootStack, rootIndex) {
  let source = rootStack[rootIndex].source;
  hookSearch: for (let i = 0; i < hookStack.length; i++) {
    if (hookStack[i].source === source) {
      // This looks like a match. Validate that the rest of both stack match up.
      for (
        let a = rootIndex + 1, b = i + 1;
        a < rootStack.length && b < hookStack.length;
        a++, b++
      ) {
        if (hookStack[b].source !== rootStack[a].source) {
          // If not, give up and try a different match.
          continue hookSearch;
        }
      }
      return i;
    }
  }
  return -1;
}

function findCommonAncestorIndex(rootStack, hookStack) {
  let rootIndex = findSharedIndex(
    hookStack,
    rootStack,
    mostLikelyAncestorIndex,
  );
  if (rootIndex !== -1) {
    return rootIndex;
  }
  // If the most likely one wasn't a hit, try any other frame to see if it is shared.
  // If that takes more than 5 frames, something probably went wrong.
  for (let i = 0; i < rootStack.length && i < 5; i++) {
    rootIndex = findSharedIndex(hookStack, rootStack, i);
    if (rootIndex !== -1) {
      mostLikelyAncestorIndex = i;
      return rootIndex;
    }
  }
  return -1;
}

function isReactWrapper(functionName, primitiveName) {
  let expectedPrimitiveName = 'use' + primitiveName;
  if (functionName.length < expectedPrimitiveName.length) {
    return false;
  }
  return (
    functionName.indexOf(expectedPrimitiveName) ===
    functionName.length - expectedPrimitiveName.length
  );
}

function findPrimitiveIndex(hookStack, hook) {
  let stackCache = getPrimitiveStackCache();
  let primitiveStack = stackCache.get(hook.primitive);
  if (primitiveStack === undefined) {
    return -1;
  }
  for (let i = 0; i < primitiveStack.length && i < hookStack.length; i++) {
    if (primitiveStack[i].source !== hookStack[i].source) {
      // If the next two frames are functions called `useX` then we assume that they're part of the
      // wrappers that the React packager or other packages adds around the dispatcher.
      if (
        i < hookStack.length - 1 &&
        isReactWrapper(hookStack[i].functionName, hook.primitive)
      ) {
        i++;
      }
      if (
        i < hookStack.length - 1 &&
        isReactWrapper(hookStack[i].functionName, hook.primitive)
      ) {
        i++;
      }
      return i;
    }
  }
  return -1;
}

function parseTrimmedStack(rootStack, hook) {
  // Get the stack trace between the primitive hook function and
  // the root function call. I.e. the stack frames of custom hooks.
  let hookStack = ErrorStackParser.parse(hook.stackError);
  let rootIndex = findCommonAncestorIndex(rootStack, hookStack);
  let primitiveIndex = findPrimitiveIndex(hookStack, hook);
  if (
    rootIndex === -1 ||
    primitiveIndex === -1 ||
    rootIndex - primitiveIndex < 2
  ) {
    // Something went wrong. Give up.
    return null;
  }
  return hookStack.slice(primitiveIndex, rootIndex - 1);
}

function parseCustomHookName(functionName: string): string {
  let startIndex = functionName.indexOf('.');
  if (startIndex === -1) {
    startIndex = 0;
  }
  if (functionName.substr(startIndex, 3) === 'use') {
    startIndex += 3;
  }
  return functionName.substr(startIndex);
}

function buildTree(rootStack, readHookLog): HooksTree {
  let rootChildren = [];
  let prevStack = null;
  let levelChildren = rootChildren;
  let stackOfChildren = [];
  for (let i = 0; i < readHookLog.length; i++) {
    let hook = readHookLog[i];
    let stack = parseTrimmedStack(rootStack, hook);
    if (stack !== null) {
      // Note: The indices 0 <= n < length-1 will contain the names.
      // The indices 1 <= n < length will contain the source locations.
      // That's why we get the name from n - 1 and don't check the source
      // of index 0.
      let commonSteps = 0;
      if (prevStack !== null) {
        // Compare the current level's stack to the new stack.
        while (commonSteps < stack.length && commonSteps < prevStack.length) {
          let stackSource = stack[stack.length - commonSteps - 1].source;
          let prevSource = prevStack[prevStack.length - commonSteps - 1].source;
          if (stackSource !== prevSource) {
            break;
          }
          commonSteps++;
        }
        // Pop back the stack as many steps as were not common.
        for (let j = prevStack.length - 1; j > commonSteps; j--) {
          levelChildren = stackOfChildren.pop();
        }
      }
      // The remaining part of the new stack are custom hooks. Push them
      // to the tree.
      for (let j = stack.length - commonSteps - 1; j >= 1; j--) {
        let children = [];
        levelChildren.push({
          name: parseCustomHookName(stack[j - 1].functionName),
          value: undefined, // TODO: Support custom inspectable values.
          subHooks: children,
        });
        stackOfChildren.push(levelChildren);
        levelChildren = children;
      }
      prevStack = stack;
    }
    levelChildren.push({
      name: hook.primitive,
      value: hook.value,
      subHooks: [],
    });
  }
  return rootChildren;
}

export function inspectHooks<Props>(
  renderFunction: Props => React$Node,
  props: Props,
): HooksTree {
  let previousDispatcher = ReactCurrentOwner.currentDispatcher;
  let readHookLog;
  ReactCurrentOwner.currentDispatcher = Dispatcher;
  let ancestorStackError;
  try {
    ancestorStackError = new Error();
    renderFunction(props);
  } finally {
    readHookLog = hookLog;
    hookLog = [];
    ReactCurrentOwner.currentDispatcher = previousDispatcher;
  }

  let rootStack = ErrorStackParser.parse(ancestorStackError);
  return buildTree(rootStack, readHookLog);
}
