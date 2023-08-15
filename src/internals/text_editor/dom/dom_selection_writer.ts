/* Kullna Editor - A small but feature-rich code editor for the web
   Copyright (C) 2022-2023 The Kullna Programming Language Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

import {TextDocument} from '../text_document';

/**
 * Mutates the selection of an HTMLElement based on a TextDocument.
 *
 * @param {HTMLElement} element - The DOM element to mutate the selection for.
 * @param {TextDocument} doc - The TextDocument representation of the content.
 */
export function mutateSelectionInDom(element: HTMLElement, doc: TextDocument): void {
  let anchorTextNode: Text | null = null;
  let anchorOffset: number = 0;
  let focusTextNode: Text | null = null;
  let focusOffset: number = 0;
  let currentPosition = 0; // Track position within the document.

  // Ensure we have a valid selection range to work with
  if (doc.anchorIndex < 0 || doc.focusIndex < 0) {
    console.error('Invalid anchor or focus indices in TextDocument.');
    return;
  }

  // Traverse the DOM of the element to find the anchor and focus nodes
  traverseNodes(element);

  // Set the selection
  if (anchorTextNode && focusTextNode) {
    const selection = window.getSelection();
    selection?.setBaseAndExtent(anchorTextNode, anchorOffset, focusTextNode, focusOffset);
  }

  /**
   * Recursively traverses the child nodes of a given node to locate the correct anchor and focus
   * text nodes and compute their offsets.
   *
   * @param {Node} node - The current node to be traversed.
   */
  function traverseNodes(node: Node): void {
    if (node.nodeType !== Node.TEXT_NODE) {
      node.childNodes.forEach(traverseNodes);
      return;
    }

    const textNode = node as Text;

    // Check if the current text node contains the anchor
    if (
      currentPosition <= doc.anchorIndex &&
      doc.anchorIndex <= currentPosition + textNode.length
    ) {
      anchorTextNode = textNode;
      anchorOffset = doc.anchorIndex - currentPosition;
    }

    // Check if the current text node contains the focus
    if (currentPosition <= doc.focusIndex && doc.focusIndex <= currentPosition + textNode.length) {
      focusTextNode = textNode;
      focusOffset = doc.focusIndex - currentPosition;
    }

    currentPosition += textNode.length;
  }
}
