/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Dispatcher as DispatcherType} from 'react-reconciler/src/ReactInternalTypes';
import type {
  ReactContext,
  ReactServerContext,
  ServerContextJSONValue,
} from 'shared/ReactTypes';
import {REACT_SERVER_CONTEXT_TYPE} from 'shared/ReactSymbols';
import {readContext as readContextImpl} from './ReactFlightNewContext';

function readContext<T: ServerContextJSONValue>(context: ReactContext<T>): T {
  if (__DEV__) {
    if (context.$$typeof !== REACT_SERVER_CONTEXT_TYPE) {
      console.error('Only ServerContext is supported in Flight');
    }
    if (currentCache === null) {
      console.error(
        'Context can only be read while React is rendering. ' +
          'In classes, you can read it in the render method or getDerivedStateFromProps. ' +
          'In function components, you can read it directly in the function body, but not ' +
          'inside Hooks like useReducer() or useMemo().',
      );
    }
  }
  return readContextImpl(((context: any): ReactServerContext<any>));
}

export const Dispatcher: DispatcherType = {
  useMemo<T>(nextCreate: () => T): T {
    return nextCreate();
  },
  useCallback<T>(callback: T): T {
    return callback;
  },
  useDebugValue(): void {},
  useDeferredValue: (unsupportedHook: any),
  useTransition: (unsupportedHook: any),
  getCacheForType<T>(resourceType: () => T): T {
    if (!currentCache) {
      throw new Error('Reading the cache is only supported while rendering.');
    }

    let entry: T | void = (currentCache.get(resourceType): any);
    if (entry === undefined) {
      entry = resourceType();
      // TODO: Warn if undefined?
      currentCache.set(resourceType, entry);
    }
    return entry;
  },
  readContext: (readContext: any),
  useContext: (readContext: any),
  useReducer: (unsupportedHook: any),
  useRef: (unsupportedHook: any),
  useState: (unsupportedHook: any),
  useInsertionEffect: (unsupportedHook: any),
  useLayoutEffect: (unsupportedHook: any),
  useImperativeHandle: (unsupportedHook: any),
  useEffect: (unsupportedHook: any),
  useId: (unsupportedHook: any),
  useMutableSource: (unsupportedHook: any),
  useSyncExternalStore: (unsupportedHook: any),
  useCacheRefresh(): <T>(?() => T, ?T) => void {
    return unsupportedRefresh;
  },
};

function unsupportedHook(): void {
  throw new Error('This Hook is not supported in Server Components.');
}

function unsupportedRefresh(): void {
  if (!currentCache) {
    throw new Error(
      'Refreshing the cache is not supported in Server Components.',
    );
  }
}

let currentCache: Map<Function, mixed> | null = null;

export function setCurrentCache(cache: Map<Function, mixed> | null) {
  currentCache = cache;
  return currentCache;
}

export function getCurrentCache() {
  return currentCache;
}
