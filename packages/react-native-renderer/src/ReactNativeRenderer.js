/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {HostComponent} from './ReactNativeTypes';
import type {ReactPortal, ReactNodeList} from 'shared/ReactTypes';
import type {ElementRef, Element, ElementType} from 'react';
import type {FiberRoot} from 'react-reconciler/src/ReactInternalTypes';

import './ReactNativeInjection';

import {
  findHostInstance,
  findHostInstanceWithWarning,
  batchedUpdates as batchedUpdatesImpl,
  discreteUpdates,
  createContainer,
  updateContainer,
  injectIntoDevTools,
  getPublicRootInstance,
} from 'react-reconciler/src/ReactFiberReconciler';
// TODO: direct imports like some-package/src/* are bad. Fix me.
import {getStackByFiberInDevAndProd} from 'react-reconciler/src/ReactFiberComponentStack';
import {createPortal as createPortalImpl} from 'react-reconciler/src/ReactPortal';
import {
  setBatchingImplementation,
  batchedUpdates,
} from './legacy-events/ReactGenericBatching';
import ReactVersion from 'shared/ReactVersion';
// Modules provided by RN:
import {
  UIManager,
  legacySendAccessibilityEvent,
} from 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface';

import {getClosestInstanceFromNode} from './ReactNativeComponentTree';
import {
  getInspectorDataForViewTag,
  getInspectorDataForViewAtPoint,
  getInspectorDataForInstance,
} from './ReactNativeFiberInspector';
import {LegacyRoot} from 'react-reconciler/src/ReactRootTags';
import ReactSharedInternals from 'shared/ReactSharedInternals';
import getComponentNameFromType from 'shared/getComponentNameFromType';
import {getNativeTagFromPublicInstance} from './ReactFabricPublicInstanceUtils';
import type {PublicInstance} from './ReactNativeHostConfig';

const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;

function findHostInstance_DEPRECATED<TElementType: ElementType>(
  componentOrHandle: ?(ElementRef<TElementType> | number),
): ?ElementRef<HostComponent<mixed>> {
  if (__DEV__) {
    const owner = ReactCurrentOwner.current;
    if (owner !== null && owner.stateNode !== null) {
      if (!owner.stateNode._warnedAboutRefsInRender) {
        console.error(
          '%s is accessing findNodeHandle inside its render(). ' +
            'render() should be a pure function of props and state. It should ' +
            'never access something that requires stale data from the previous ' +
            'render, such as refs. Move this logic to componentDidMount and ' +
            'componentDidUpdate instead.',
          getComponentNameFromType(owner.type) || 'A component',
        );
      }

      owner.stateNode._warnedAboutRefsInRender = true;
    }
  }

  if (componentOrHandle == null) {
    return null;
  }

  // For compatibility with Paper
  if (componentOrHandle._nativeTag != null) {
    // $FlowExpectedError[incompatible-cast] For compatibility with Paper (when using Fabric)
    return (componentOrHandle: PublicInstance);
  }

  // Fabric-specific
  if (componentOrHandle.publicInstance != null) {
    // $FlowExpectedError[incompatible-cast] For compatibility with Fabric (when using Paper)
    return (componentOrHandle.publicInstance: PublicInstance);
  }

  let hostInstance;
  if (__DEV__) {
    hostInstance = findHostInstanceWithWarning(
      componentOrHandle,
      'findHostInstance_DEPRECATED',
    );
  } else {
    hostInstance = findHostInstance(componentOrHandle);
  }

  return hostInstance;
}

function findNodeHandle(componentOrHandle: any): ?number {
  if (__DEV__) {
    const owner = ReactCurrentOwner.current;
    if (owner !== null && owner.stateNode !== null) {
      if (!owner.stateNode._warnedAboutRefsInRender) {
        console.error(
          '%s is accessing findNodeHandle inside its render(). ' +
            'render() should be a pure function of props and state. It should ' +
            'never access something that requires stale data from the previous ' +
            'render, such as refs. Move this logic to componentDidMount and ' +
            'componentDidUpdate instead.',
          getComponentNameFromType(owner.type) || 'A component',
        );
      }

      owner.stateNode._warnedAboutRefsInRender = true;
    }
  }

  if (componentOrHandle == null) {
    return null;
  }

  if (typeof componentOrHandle === 'number') {
    // Already a node handle
    return componentOrHandle;
  }

  // For compatibility with Paper
  if (componentOrHandle._nativeTag) {
    return componentOrHandle._nativeTag;
  }

  if (componentOrHandle.internals != null) {
    const nativeTag = componentOrHandle.internals.nativeTag;
    if (nativeTag != null) {
      return nativeTag;
    }
  }

  let hostInstance;
  if (__DEV__) {
    hostInstance = findHostInstanceWithWarning(
      componentOrHandle,
      'findNodeHandle',
    );
  } else {
    hostInstance = findHostInstance(componentOrHandle);
  }

  if (hostInstance == null) {
    return hostInstance;
  }

  // $FlowExpectedError[prop-missing] For compatibility with Paper (when using Fabric)
  if (hostInstance._nativeTag != null) {
    // $FlowExpectedError[incompatible-return]
    return hostInstance._nativeTag;
  }

  // $FlowExpectedError[incompatible-call] For compatibility with Fabric (when using Paper)
  return getNativeTagFromPublicInstance(hostInstance);
}

function dispatchCommand(handle: any, command: string, args: Array<any>) {
  if (handle._nativeTag == null) {
    if (__DEV__) {
      console.error(
        "dispatchCommand was called with a ref that isn't a " +
          'native component. Use React.forwardRef to get access to the underlying native component',
      );
    }
    return;
  }

  if (handle._internalInstanceHandle != null) {
    const {stateNode} = handle._internalInstanceHandle;
    if (stateNode != null) {
      nativeFabricUIManager.dispatchCommand(stateNode.node, command, args);
    }
  } else {
    UIManager.dispatchViewManagerCommand(handle._nativeTag, command, args);
  }
}

function sendAccessibilityEvent(handle: any, eventType: string) {
  if (handle._nativeTag == null) {
    if (__DEV__) {
      console.error(
        "sendAccessibilityEvent was called with a ref that isn't a " +
          'native component. Use React.forwardRef to get access to the underlying native component',
      );
    }
    return;
  }

  if (handle._internalInstanceHandle != null) {
    const {stateNode} = handle._internalInstanceHandle;
    if (stateNode != null) {
      nativeFabricUIManager.sendAccessibilityEvent(stateNode.node, eventType);
    }
  } else {
    legacySendAccessibilityEvent(handle._nativeTag, eventType);
  }
}

// $FlowFixMe[missing-local-annot]
function onRecoverableError(error) {
  // TODO: Expose onRecoverableError option to userspace
  // eslint-disable-next-line react-internal/no-production-logging, react-internal/warning-args
  console.error(error);
}

function render(
  element: Element<ElementType>,
  containerTag: number,
  callback: ?() => void,
): ?ElementRef<ElementType> {
  let root = roots.get(containerTag);

  if (!root) {
    // TODO (bvaughn): If we decide to keep the wrapper component,
    // We could create a wrapper for containerTag as well to reduce special casing.
    root = createContainer(
      containerTag,
      LegacyRoot,
      null,
      false,
      null,
      '',
      onRecoverableError,
      null,
    );
    roots.set(containerTag, root);
  }
  updateContainer(element, root, null, callback);

  // $FlowFixMe Flow has hardcoded values for React DOM that don't work with RN
  return getPublicRootInstance(root);
}

function unmountComponentAtNode(containerTag: number) {
  const root = roots.get(containerTag);
  if (root) {
    // TODO: Is it safe to reset this now or should I wait since this unmount could be deferred?
    updateContainer(null, root, null, () => {
      roots.delete(containerTag);
    });
  }
}

function unmountComponentAtNodeAndRemoveContainer(containerTag: number) {
  unmountComponentAtNode(containerTag);

  // Call back into native to remove all of the subviews from this container
  UIManager.removeRootView(containerTag);
}

function createPortal(
  children: ReactNodeList,
  containerTag: number,
  key: ?string = null,
): ReactPortal {
  return createPortalImpl(children, containerTag, null, key);
}

setBatchingImplementation(batchedUpdatesImpl, discreteUpdates);

function computeComponentStackForErrorReporting(reactTag: number): string {
  const fiber = getClosestInstanceFromNode(reactTag);
  if (!fiber) {
    return '';
  }
  return getStackByFiberInDevAndProd(fiber);
}

const roots = new Map<number, FiberRoot>();

const Internals = {
  computeComponentStackForErrorReporting,
};

export {
  // This is needed for implementation details of TouchableNativeFeedback
  // Remove this once TouchableNativeFeedback doesn't use cloneElement
  findHostInstance_DEPRECATED,
  findNodeHandle,
  dispatchCommand,
  sendAccessibilityEvent,
  render,
  unmountComponentAtNode,
  unmountComponentAtNodeAndRemoveContainer,
  createPortal,
  batchedUpdates as unstable_batchedUpdates,
  Internals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // This export is typically undefined in production builds.
  // See the "enableGetInspectorDataForInstanceInProduction" flag.
  getInspectorDataForInstance,
};

injectIntoDevTools({
  findFiberByHostInstance: getClosestInstanceFromNode,
  bundleType: __DEV__ ? 1 : 0,
  version: ReactVersion,
  rendererPackageName: 'react-native-renderer',
  rendererConfig: {
    getInspectorDataForViewTag: getInspectorDataForViewTag,
    getInspectorDataForViewAtPoint: getInspectorDataForViewAtPoint.bind(
      null,
      findNodeHandle,
    ),
  },
});
