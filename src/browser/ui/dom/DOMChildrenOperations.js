/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

"use strict";

var Danger = require('Danger');
var ReactMultiChildUpdateTypes = require('ReactMultiChildUpdateTypes');

var getTextContentAccessor = require('getTextContentAccessor');

/**
 * The DOM property to use when setting text content.
 *
 * @type {string}
 * @private
 */
var textContentAccessor = getTextContentAccessor();

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt(parentNode, childNode, index) {
  var childNodes = parentNode.childNodes;
  if (childNodes[index] === childNode) {
    return;
  }
  // If `childNode` is already a child of `parentNode`, remove it so that
  // computing `childNodes[index]` takes into account the removal.
  if (childNode.parentNode === parentNode) {
    parentNode.removeChild(childNode);
  }
  if (index >= childNodes.length) {
    parentNode.appendChild(childNode);
  } else {
    parentNode.insertBefore(childNode, childNodes[index]);
  }
}

var updateTextContent;
if (textContentAccessor === 'textContent') {
  /**
   * Sets the text content of `node` to `text`.
   *
   * @param {DOMElement} node Node to change
   * @param {string} text New text content
   */
  updateTextContent = function(node, text) {
    node.textContent = text;
  };
} else {
  /**
   * Sets the text content of `node` to `text`.
   *
   * @param {DOMElement} node Node to change
   * @param {string} text New text content
   */
  updateTextContent = function(node, text) {
    // In order to preserve newlines correctly, we can't use .innerText to set
    // the contents (see #1080), so we empty the element then append a text node
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    if (text) {
      var doc = node.ownerDocument || document;
      node.appendChild(doc.createTextNode(text));
    }
  };
}

/**
 * Move `childNode` as a child of `parentNode` `steps` to the right.
 * By shifting nodes on the right side over to the left side, the node moves
 * without being physically moved itself, this is very important for iframes.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} steps Numbers of steps the child should be moved right.
 * @internal
 */
function shiftChild(parentNode, childNode, steps) {
  // We only support moving right as the current implementation of
  // `ReactMultiChild` always moves components by inserting them further right.
  for (var i = 0; i < steps; i++) {
    parentNode.insertBefore(childNode.nextSibling, childNode);
  }
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  updateTextContent: updateTextContent,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function(updates, markupList) {
    var update, updatedChild, parentID;
    
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null;
    // List of children that will be moved or removed.
    var updatedChildren = null;

    // List of updates that are immovable.
    var immovableUpdates = null;
    // List of siblings to immovable nodes that have been removed.
    var removedSiblings = null;
    // List of siblings to immovable nodes that have been inserted.
    var insertedSiblings = null;
    
    for (var i = 0; update = updates[i]; i++) {
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING ||
          update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        updatedChild = update.parentNode.childNodes[update.fromIndex];
        parentID = update.parentID;
        
        initialChildren = initialChildren || {};
        initialChildren[parentID] = initialChildren[parentID] || [];
        initialChildren[parentID][update.fromIndex] = updatedChild;
        
        if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING &&
            updatedChild.hasAttribute('data-reactimmovable')) {
          immovableUpdates = immovableUpdates || {};
          immovableUpdates[parentID] = immovableUpdates[parentID] || [];
          
          var lastParentImmovableUpdate =
            immovableUpdates[parentID][immovableUpdates[parentID].length - 1];
          
          if (!lastParentImmovableUpdate ||
              lastParentImmovableUpdate.fromIndex < update.fromIndex) {
            // We're not crossing a boundary of any other immovable object.
            // Assumption: This relies on `ReactMultiChild` moving nodes by
            // `toIndex` in ascending order.
            update.type = ReactMultiChildUpdateTypes.SHIFT_IMMOVABLE;
            immovableUpdates[parentID].push(update);
            continue;
          }
          
          // Unstoppable force meets immovable object, this is a violation,
          // our only way out of this is to not treat it as immovable.
        }
        
        updatedChildren = updatedChildren || [];
        updatedChildren.push(updatedChild);
      }
    }

    var renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; updatedChild = updatedChildren[j]; j++) {
        updatedChild.parentNode.removeChild(updatedChild);
      }
    }
    
    // If we found immovable objects, we need to do another pass and collect
    // information on all sibling insertions and deletions for the parent.
    if (immovableUpdates) {
      for (var k = 0; update = updates[k]; k++) {
        parentID = update.parentID;
        
        if (immovableUpdates[parentID]) {
          if (update.type === ReactMultiChildUpdateTypes.INSERT_MARKUP ||
              update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING) {
            insertedSiblings = insertedSiblings || {};
            insertedSiblings[parentID] = insertedSiblings[parentID] || [];
            insertedSiblings[parentID].push(update.toIndex);
          }
          if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING ||
              update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
            removedSiblings = removedSiblings || {};
            removedSiblings[parentID] = removedSiblings[parentID] || [];
            removedSiblings[parentID].push(update.fromIndex);
          }
        }
      }
      
      /**
       * Assumption: `toIndex` is always greater than `fromIndex` for moves.
       * `ReactMultiChild` currently exploits this behavior by not issuing moves
       * for nodes that will have moved due to nodes being removed before it.
       * This is based on the assumption that `DOMChildrenOperations` detach all
       * touched nodes to keep indexes generated by `ReactMultiChild`
       * consistent.
       *
       * Since immovable nodes must not be detached, we need to push them right
       * and out of the way so that the indexes remain consistent. We do this
       * by counting all insertions and deletions taking place before the
       * immovable node, this allows us to compute its actual toIndex and
       * fromIndex. Now we can simply shift it from its fromIndex to toIndex.
       */
      for (parentID in immovableUpdates) {
        for (var l = immovableUpdates[parentID].length - 1; l >= 0; l--) {
          update = immovableUpdates[parentID][l];
          
          var actualFromIndex = update.fromIndex;
          if (removedSiblings && removedSiblings[parentID]) {
            for (var m = 0; m < removedSiblings[parentID].length; m++) {
              if (removedSiblings[parentID][m] < update.fromIndex) {
                actualFromIndex--;
              }
            }
          }
          
          var actualToIndex = update.toIndex;
          if (insertedSiblings && insertedSiblings[parentID]) {
            for (var n = 0; n < insertedSiblings[parentID].length; n++) {
              if (insertedSiblings[parentID][n] < update.toIndex) {
                actualToIndex--;
              }
            }
          }
          
          shiftChild(
            update.parentNode,
            initialChildren[parentID][update.fromIndex],
            actualToIndex - actualFromIndex
          );
        }
      }
    }
       
    for (var o = 0; update = updates[o]; o++) {
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(
            update.parentNode,
            renderedMarkup[update.markupIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(
            update.parentNode,
            initialChildren[update.parentID][update.fromIndex],
            update.toIndex
          );
          break;
        //case ReactMultiChildUpdateTypes.SHIFT_IMMOVABLE:
          // Already moved into position by the loops above.
          //break;
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          updateTextContent(
            update.parentNode,
            update.textContent
          );
          break;
        //case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          //break;
      }
    }
  }

};

module.exports = DOMChildrenOperations;
