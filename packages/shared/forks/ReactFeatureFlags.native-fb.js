/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import typeof * as FeatureFlagsType from 'shared/ReactFeatureFlags';
import typeof * as ExportsType from './ReactFeatureFlags.native-fb';

// The rest of the flags are static for better dead code elimination.
export const enableDebugTracing = false;
export const enableSchedulingProfiler = false;
export const enableProfilerTimer = __PROFILE__;
export const enableProfilerCommitHooks = __PROFILE__;
export const enableProfilerNestedUpdatePhase = __PROFILE__;
export const enableProfilerNestedUpdateScheduledHook = false;
export const enableUpdaterTracking = __PROFILE__;
export const enableSuspenseServerRenderer = false;
export const enableSelectiveHydration = false;
export const enableLazyElements = false;
export const enableCache = false;
export const enableSchedulerDebugging = false;
export const debugRenderPhaseSideEffectsForStrictMode = true;
export const disableJavaScriptURLs = false;
export const disableInputAttributeSyncing = false;
export const replayFailedUnitOfWorkWithInvokeGuardedCallback = __DEV__;
export const warnAboutDeprecatedLifecycles = true;
export const enableScopeAPI = false;
export const enableCreateEventHandleAPI = false;
export const enableSuspenseCallback = false;
export const warnAboutDefaultPropsOnFunctionComponents = false;
export const warnAboutStringRefs = false;
export const disableLegacyContext = false;
export const disableSchedulerTimeoutBasedOnReactExpirationTime = false;
export const enableTrustedTypesIntegration = false;
export const disableTextareaChildren = false;
export const disableModulePatternComponents = false;
export const warnUnstableRenderSubtreeIntoContainer = false;
export const warnAboutSpreadingKeyToJSX = false;
export const enableComponentStackLocations = false;
export const enableLegacyFBSupport = false;
export const enableFilterEmptyStringAttributesDOM = false;
export const disableNativeComponentFrames = false;
export const skipUnmountedBoundaries = false;
export const deletedTreeCleanUpLevel = 3;
export const enableSuspenseLayoutEffectSemantics = false;
export const enableGetInspectorDataForInstanceInProduction = true;
export const enableNewReconciler = false;
export const deferRenderPhaseUpdateToNextBatch = false;

export const enableStrictEffects = __DEV__;
export const createRootStrictEffectsByDefault = false;
export const enableUseRefAccessWarning = false;

export const enableRecursiveCommitTraversal = false;
export const disableSchedulerTimeoutInWorkLoop = false;
export const enableLazyContextPropagation = false;
export const enableSyncDefaultUpdates = true;
export const allowConcurrentByDefault = true;
// TODO: Import this from internal ReactNativeFeatureFlags instead
export const enablePersistentOffscreenHostContainer = __EXPERIMENTAL__;

// Flow magic to verify the exports of this file match the original version.
// eslint-disable-next-line no-unused-vars
type Check<_X, Y: _X, X: Y = _X> = null;
// eslint-disable-next-line no-unused-expressions
(null: Check<ExportsType, FeatureFlagsType>);
