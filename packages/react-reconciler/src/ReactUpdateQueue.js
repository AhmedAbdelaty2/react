/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// UpdateQueue is a linked list of prioritized updates.
//
// Like fibers, update queues come in pairs: a current queue, which represents
// the visible state of the screen, and a work-in-progress queue, which is
// can be mutated and processed asynchronously before it is committed — a form
// of double buffering. If a work-in-progress render is discarded before
// finishing, we create a new work-in-progress by cloning the current queue.
//
// Both queues share a persistent, singly-linked list structure. To schedule an
// update, we append it to the end of both queues. Each queue maintains a
// pointer to first update in the persistent list that hasn't been processed.
// The work-in-progress pointer always has a position equal to or greater than
// the current queue, since we always work on that one. The current queue's
// pointer is only updated during the commit phase, when we swap in the
// work-in-progress.
//
// For example:
//
//   Current pointer:           A - B - C - D - E - F
//   Work-in-progress pointer:              D - E - F
//                                          ^
//                                          The work-in-progress queue has
//                                          processed more updates than current.
//
// The reason we append to both queues is because otherwise we might drop
// updates without ever processing them. For example, if we only add updates to
// the work-in-progress queue, some updates could be lost whenever a work-in
// -progress render restarts by cloning from current. Similarly, if we only add
// updates to the current queue, the updates will be lost whenever an already
// in-progress queue commits and swaps with the current queue. However, by
// adding to both queues, we guarantee that the update will be part of the next
// work-in-progress. (And because the work-in-progress queue becomes the
// current queue once it commits, there's no danger of applying the same
// update twice.)
//
// Prioritization
// --------------
//
// Updates are not sorted by priority, but by insertion; new updates are always
// appended to the end of the list.
//
// The priority is still important, though. When processing the update queue
// during the render phase, only the updates with sufficient priority are
// included in the result. If we skip an update because it has insufficient
// priority, it remains in the queue to be processed later, during a lower
// priority render. Crucially, all updates subsequent to a skipped update also
// remain in the queue *regardless of their priority*. That means high priority
// updates are sometimes processed twice, at two separate priorities. We also
// keep track of a base state, that represents the state before the first
// update in the queue is applied.
//
// For example:
//
//   Given a base state of '', and the following queue of updates
//
//     A1 - B2 - C1 - D2
//
//   where the number indicates the priority, and the update is applied to the
//   previous state by appending a letter, React will process these updates as
//   two separate renders, one per distinct priority level:
//
//   First render, at priority 1:
//     Base state: ''
//     Updates: [A1, C1]
//     Result state: 'AC'
//
//   Second render, at priority 2:
//     Base state: 'A'            <-  The base state does not include C1,
//                                    because B2 was skipped.
//     Updates: [B2, C1, D2]      <-  C1 was rebased on top of B2
//     Result state: 'ABCD'
//
// Because we process updates in insertion order, and rebase high priority
// updates when preceding updates are skipped, the final result is deterministic
// regardless of priority. Intermediate state may vary according to system
// resources, but the final state is always the same.
//
// Render phase updates
// --------------------
//
// A render phase update is one triggered during the render phase, while working
// on a work-in-progress tree. Our typical strategy of adding the update to both
// queues won't work, because if the work-in-progress is thrown out and
// restarted, we'll get duplicate updates. Instead, we only add render phase
// updates to the work-in-progress queue.
//
// Because normal updates are added to a persistent list that is shared between
// both queues, render phase updates go in a special list that only belongs to
// a single queue. This an artifact of structural sharing. If we instead
// implemented each queue as separate lists, we would append render phase
// updates to the end of the work-in-progress list.
//
// Examples of render phase updates:
// - getDerivedStateFromProps
// - getDerivedStateFromCatch
// - [future] loading state

import type {Fiber} from './ReactFiber';
import type {ExpirationTime} from './ReactFiberExpirationTime';

import {NoWork} from './ReactFiberExpirationTime';
import {UpdateQueue as UpdateQueueEffect} from 'shared/ReactTypeOfSideEffect';
import {ClassComponent} from 'shared/ReactTypeOfWork';

import warning from 'fbjs/lib/warning';

export type Update<State> = {
  expirationTime: ExpirationTime,

  process: ((workInProgress: Fiber, prevState: State) => State) | null,
  commit: ((finishedWork: Fiber) => mixed) | null,

  next: Update<State> | null,
  nextEffect: Update<State> | null,
};

export type UpdateQueue<State> = {
  expirationTime: ExpirationTime,
  baseState: State,

  firstUpdate: Update<State> | null,
  lastUpdate: Update<State> | null,

  firstRenderPhaseUpdate: Update<State> | null,
  lastRenderPhaseUpdate: Update<State> | null,

  firstCapturedUpdate: Update<State> | null,
  lastCapturedUpdate: Update<State> | null,

  firstEffect: Update<State> | null,
  lastEffect: Update<State> | null,

  // DEV-only
  isProcessing?: boolean,
};

let didWarnUpdateInsideUpdate;
if (__DEV__) {
  didWarnUpdateInsideUpdate = false;
}

function createUpdateQueue<State>(baseState: State): UpdateQueue<State> {
  const queue: UpdateQueue<State> = {
    expirationTime: NoWork,
    baseState,
    firstUpdate: null,
    lastUpdate: null,
    firstRenderPhaseUpdate: null,
    lastRenderPhaseUpdate: null,
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,
    firstEffect: null,
    lastEffect: null,
  };
  if (__DEV__) {
    queue.isProcessing = false;
  }
  return queue;
}

function cloneUpdateQueue<State>(
  currentQueue: UpdateQueue<State>,
): UpdateQueue<State> {
  const queue: UpdateQueue<State> = {
    expirationTime: currentQueue.expirationTime,
    baseState: currentQueue.baseState,
    firstUpdate: currentQueue.firstUpdate,
    lastUpdate: currentQueue.lastUpdate,

    // These are only valid for the lifetime of a single work-in-progress.
    firstRenderPhaseUpdate: null,
    lastRenderPhaseUpdate: null,

    // TODO: With resuming, if we bail out and resuse the child tree, we should
    // keep these effects.
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,

    firstEffect: null,
    lastEffect: null,
  };
  if (__DEV__) {
    queue.isProcessing = false;
  }
  return queue;
}

export function createUpdate(expirationTime: ExpirationTime): Update<*> {
  return {
    expirationTime: expirationTime,

    process: null,
    commit: null,

    next: null,
    nextEffect: null,
  };
}

function appendUpdateToQueue<State>(
  queue: UpdateQueue<State>,
  update: Update<State>,
  expirationTime: ExpirationTime,
) {
  // Append the update to the end of the list.
  if (queue.lastUpdate === null) {
    // Queue is empty
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
  if (
    queue.expirationTime === NoWork ||
    queue.expirationTime > expirationTime
  ) {
    // The incoming update has the earliest expiration of any update in the
    // queue. Update the queue's expiration time.
    queue.expirationTime = expirationTime;
  }
}

export function enqueueUpdate<State>(
  fiber: Fiber,
  update: Update<State>,
  expirationTime: ExpirationTime,
) {
  // Update queues are created lazily.
  const alternate = fiber.alternate;
  let queue1;
  let queue2;
  if (alternate === null) {
    // There's only one fiber.
    queue1 = fiber.updateQueue;
    queue2 = null;
    if (queue1 === null) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // There are two owners.
    queue1 = fiber.updateQueue;
    queue2 = alternate.updateQueue;
    if (queue1 === null) {
      if (queue2 === null) {
        // Neither fiber has an update queue. Create new ones.
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(
          alternate.memoizedState,
        );
      } else {
        // Only one fiber has an update queue. Clone to create a new one.
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        // Only one fiber has an update queue. Clone to create a new one.
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      } else {
        // Both owners have an update queue.
      }
    }
  }
  if (queue2 === null || queue1 === queue2) {
    // There's only a single queue.
    appendUpdateToQueue(queue1, update, expirationTime);
  } else {
    // There are two queues. We need to append the update to both queues,
    // while accounting for the persistent structure of the list — we don't
    // want the same update to be added multiple times.
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      // One of the queues is not empty. We must add the update to both queues.
      appendUpdateToQueue(queue1, update, expirationTime);
      appendUpdateToQueue(queue2, update, expirationTime);
    } else {
      // Both queues are non-empty. The last update is the same in both lists,
      // because of structural sharing. So, only append to one of the lists.
      appendUpdateToQueue(queue1, update, expirationTime);
      // But we still need to update the `lastUpdate` pointer of queue2.
      queue2.lastUpdate = update;
    }
  }

  if (__DEV__) {
    if (
      fiber.tag === ClassComponent &&
      (queue1.isProcessing || (queue2 !== null && queue2.isProcessing)) &&
      !didWarnUpdateInsideUpdate
    ) {
      warning(
        false,
        'An update (setState, replaceState, or forceUpdate) was scheduled ' +
          'from inside an update function. Update functions should be pure, ' +
          'with zero side-effects. Consider using componentDidUpdate or a ' +
          'callback.',
      );
      didWarnUpdateInsideUpdate = true;
    }
  }
}

export function enqueueRenderPhaseUpdate<State>(
  workInProgress: Fiber,
  update: Update<State>,
  renderExpirationTime: ExpirationTime,
) {
  // Render phase updates go into a separate list, and only on the work-in-
  // progress queue.
  let workInProgressQueue = workInProgress.updateQueue;
  if (workInProgressQueue === null) {
    workInProgressQueue = workInProgress.updateQueue = createUpdateQueue(
      workInProgress.memoizedState,
    );
  } else {
    // TODO: I put this here rather than createWorkInProgress so that we don't
    // clone the queue unnecessarily. There's probably a better way to
    // structure this.
    workInProgressQueue = ensureWorkInProgressQueueIsAClone(
      workInProgress,
      workInProgressQueue,
    );
  }

  // Append the update to the end of the list.
  if (workInProgressQueue.lastRenderPhaseUpdate === null) {
    // This is the first render phase update
    workInProgressQueue.firstRenderPhaseUpdate = workInProgressQueue.lastRenderPhaseUpdate = update;
  } else {
    workInProgressQueue.lastRenderPhaseUpdate.next = update;
    workInProgressQueue.lastRenderPhaseUpdate = update;
  }
  if (
    workInProgressQueue.expirationTime === NoWork ||
    workInProgressQueue.expirationTime > renderExpirationTime
  ) {
    // The incoming update has the earliest expiration of any update in the
    // queue. Update the queue's expiration time.
    workInProgressQueue.expirationTime = renderExpirationTime;
  }
}

export function enqueueCapturedUpdate<State>(
  workInProgress: Fiber,
  update: Update<State>,
  renderExpirationTime: ExpirationTime,
) {
  // Captured updates go into a separate list, and only on the work-in-
  // progress queue.
  let workInProgressQueue = workInProgress.updateQueue;
  if (workInProgressQueue === null) {
    workInProgressQueue = workInProgress.updateQueue = createUpdateQueue(
      workInProgress.memoizedState,
    );
  } else {
    // TODO: I put this here rather than createWorkInProgress so that we don't
    // clone the queue unnecessarily. There's probably a better way to
    // structure this.
    workInProgressQueue = ensureWorkInProgressQueueIsAClone(
      workInProgress,
      workInProgressQueue,
    );
  }

  // Append the update to the end of the list.
  if (workInProgressQueue.lastCapturedUpdate === null) {
    // This is the first render phase update
    workInProgressQueue.firstCapturedUpdate = workInProgressQueue.lastCapturedUpdate = update;
  } else {
    workInProgressQueue.lastCapturedUpdate.next = update;
    workInProgressQueue.lastCapturedUpdate = update;
  }
  if (
    workInProgressQueue.expirationTime === NoWork ||
    workInProgressQueue.expirationTime > renderExpirationTime
  ) {
    // The incoming update has the earliest expiration of any update in the
    // queue. Update the queue's expiration time.
    workInProgressQueue.expirationTime = renderExpirationTime;
  }
}

function addToEffectList<State>(
  queue: UpdateQueue<State>,
  update: Update<State>,
) {
  // Set this to null, in case it was mutated during an aborted render.
  update.nextEffect = null;
  if (queue.lastEffect === null) {
    queue.firstEffect = queue.lastEffect = update;
  } else {
    queue.lastEffect.nextEffect = update;
    queue.lastEffect = update;
  }
}

function processSingleUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
): State {
  const commit = update.commit;
  const process = update.process;
  if (commit !== null) {
    workInProgress.effectTag |= UpdateQueueEffect;
    addToEffectList(queue, update);
  }
  if (process !== null) {
    return process(workInProgress, prevState);
  } else {
    return prevState;
  }
}

function ensureWorkInProgressQueueIsAClone<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
): UpdateQueue<State> {
  const current = workInProgress.alternate;
  if (current !== null) {
    // If the work-in-progress queue is equal to the current queue,
    // we need to clone it first.
    if (queue === current.updateQueue) {
      queue = workInProgress.updateQueue = cloneUpdateQueue(queue);
    }
  }
  return queue;
}

export function processUpdateQueue<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  renderExpirationTime: ExpirationTime,
): void {
  if (
    queue.expirationTime === NoWork ||
    queue.expirationTime > renderExpirationTime
  ) {
    // Insufficient priority. Bailout.
    return;
  }

  queue = ensureWorkInProgressQueueIsAClone(workInProgress, queue);

  if (__DEV__) {
    queue.isProcessing = true;
  }

  // These values may change as we process the queue.
  let newBaseState = queue.baseState;
  let newFirstUpdate = null;
  let newExpirationTime = NoWork;

  // Iterate through the list of updates to compute the result.
  let update = queue.firstUpdate;
  let resultState = newBaseState;
  while (update !== null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime > renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      if (newFirstUpdate === null) {
        // This is the first skipped update. It will be the first update in
        // the new list.
        newFirstUpdate = update;
        // Since this is the first update that was skipped, the current result
        // is the new base state.
        newBaseState = resultState;
      }
      // Since this update will remain in the list, update the remaining
      // expiration time.
      if (
        newExpirationTime === NoWork ||
        newExpirationTime > updateExpirationTime
      ) {
        newExpirationTime = updateExpirationTime;
      }
    } else {
      // This update does have sufficient priority. Process it and compute
      // a new result.
      resultState = processSingleUpdate(
        workInProgress,
        queue,
        update,
        resultState,
      );
    }
    // Continue to the next update.
    update = update.next;
  }

  // Separately, iterate though the list of render phase updates.
  let newFirstRenderPhaseUpdate = null;
  update = queue.firstRenderPhaseUpdate;
  while (update !== null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime > renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      if (newFirstRenderPhaseUpdate === null) {
        // This is the first skipped render phase update. It will be the first
        // update in the new list.
        newFirstRenderPhaseUpdate = update;
        // If this is the first update that was skipped (including the non-
        // render phase updates!), the current result is the new base state.
        if (newFirstUpdate === null) {
          newBaseState = resultState;
        }
      }
      // Since this update will remain in the list, update the remaining
      // expiration time.
      if (
        newExpirationTime === NoWork ||
        newExpirationTime > updateExpirationTime
      ) {
        newExpirationTime = updateExpirationTime;
      }
    } else {
      // This update does have sufficient priority. Process it and compute
      // a new result.
      resultState = processSingleUpdate(
        workInProgress,
        queue,
        update,
        resultState,
      );
    }
    update = update.next;
  }

  // Separately, iterate though the list of captured updates.
  let newFirstCapturedUpdate = null;
  update = queue.firstCapturedUpdate;
  while (update !== null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime > renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      if (newFirstCapturedUpdate === null) {
        // This is the first skipped captured update. It will be the first
        // update in the new list.
        newFirstCapturedUpdate = update;
        // If this is the first update that was skipped, the current result is
        // the new base state.
        if (newFirstUpdate === null && newFirstRenderPhaseUpdate === null) {
          newBaseState = resultState;
        }
      }
      // Since this update will remain in the list, update the remaining
      // expiration time.
      if (
        newExpirationTime === NoWork ||
        newExpirationTime > updateExpirationTime
      ) {
        newExpirationTime = updateExpirationTime;
      }
    } else {
      // This update does have sufficient priority. Process it and compute
      // a new result.
      resultState = processSingleUpdate(
        workInProgress,
        queue,
        update,
        resultState,
      );
    }
    update = update.next;
  }

  if (newFirstUpdate === null) {
    queue.lastUpdate = null;
  }
  if (newFirstRenderPhaseUpdate === null) {
    queue.lastRenderPhaseUpdate = null;
  } else {
    workInProgress.effectTag |= UpdateQueueEffect;
  }
  if (newFirstCapturedUpdate === null) {
    queue.lastCapturedUpdate = null;
  } else {
    workInProgress.effectTag |= UpdateQueueEffect;
  }
  if (
    newFirstUpdate === null &&
    newFirstRenderPhaseUpdate === null &&
    newFirstCapturedUpdate === null
  ) {
    // We processed every update, without skipping. That means the new base
    // state is the same as the result state.
    newBaseState = resultState;
  }

  queue.baseState = newBaseState;
  queue.firstUpdate = newFirstUpdate;
  queue.firstRenderPhaseUpdate = newFirstRenderPhaseUpdate;
  queue.firstCapturedUpdate = newFirstCapturedUpdate;
  queue.expirationTime = newExpirationTime;

  workInProgress.memoizedState = resultState;

  if (__DEV__) {
    queue.isProcessing = false;
  }
}

export function commitUpdateQueue<State>(
  finishedWork: Fiber,
  finishedQueue: UpdateQueue<State>,
  renderExpirationTime: ExpirationTime,
): void {
  // If the finished render included render phase updates, and there are still
  // lower priority updates left over, we need to keep the render phase updates
  // in the queue so that they are rebased and not dropped once we process the
  // queue again at the lower priority.
  if (finishedQueue.firstRenderPhaseUpdate !== null) {
    // Join the render phase update list to the end of the normal list.
    if (finishedQueue.lastUpdate !== null) {
      finishedQueue.lastUpdate.next = finishedQueue.firstRenderPhaseUpdate;
      finishedQueue.lastUpdate = finishedQueue.lastRenderPhaseUpdate;
    }
    // Clear the list of render phase updates.
    finishedQueue.firstRenderPhaseUpdate = finishedQueue.lastRenderPhaseUpdate = null;
  }

  // Same with captured updates
  if (finishedQueue.firstCapturedUpdate !== null) {
    // Join the render phase update list to the end of the normal list.
    if (finishedQueue.lastUpdate !== null) {
      finishedQueue.lastUpdate.next = finishedQueue.firstCapturedUpdate;
      finishedQueue.lastUpdate = finishedQueue.lastCapturedUpdate;
    }
    // Clear the list of render phase updates.
    finishedQueue.firstCapturedUpdate = finishedQueue.lastCapturedUpdate = null;
  }

  // Commit the effects
  let effect = finishedQueue.firstEffect;
  finishedQueue.firstEffect = finishedQueue.lastEffect = null;
  while (effect !== null) {
    const commit = effect.commit;
    if (commit !== null) {
      effect.commit = null;
      commit(finishedWork);
    }
    effect = effect.nextEffect;
  }
}
