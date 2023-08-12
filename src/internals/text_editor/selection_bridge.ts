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

import {Package} from '../../package';
import {TextDocument} from './text_document';

/** Synchronizes the selection state between the DOM and the editor. */
export class SelectionBridge {
  constructor(private readonly element: HTMLElement) {}

  /**
   * Gets the current selection from the window, asserting that it exists.
   *
   * @remarks
   *   There are limited cases where the selection may not exist, such as when the user is not focused
   *   on the editor. In these cases, an error is thrown. This function should only be used when the
   *   selection is guaranteed to exist.
   * @returns The current selection.
   */
  getRawSelection() {
    if (!this.element.parentNode) {
      throw new Error('editor.parentNode is unexpectedly null');
    }
    if (this.element.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const result = (this.element.parentNode as Document).getSelection();
      if (result) {
        return result;
      }
    }
    const result = window.getSelection();
    if (result) {
      return result;
    }
    throw new Error('window.getSelection() unexpectedly returned null');
  }

  /**
   * Reads the current selection from the DOM. As part of this process, the text of the DOM is read.
   *
   * @returns The current position.
   */
  readSelection(): TextDocument {
    if (Package.environment === 'DEVELOPMENT') {
      // skipcq: JS-0002: Avoid console
      console.log(' 🔍 Scanning DOM for Changes');
    }

    const selection = this.getRawSelection();
    const element = this.element;
    const content = element.textContent ?? '';
    if (selection.type === 'None') return new TextDocument(0, 0, content, true);

    let {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
    if (!anchorNode || !focusNode) {
      throw new Error('AnchorNode or FocusNode not found when getting selection.');
    }

    // If the anchor and focus are the editor element, return either a full
    // highlight or a start/end cursor position depending on the selection
    if (anchorNode === element && focusNode === element) {
      const defaultSelection = new TextDocument(
        anchorOffset > 0 && element.textContent ? element.textContent.length : 0,
        focusOffset > 0 && element.textContent ? element.textContent.length : 0,
        content
      );
      return defaultSelection;
    }

    // Selection anchor and focus are expected to be text nodes,
    // so normalize them.
    if (anchorNode.nodeType === Node.ELEMENT_NODE) {
      const node = document.createTextNode('');
      anchorNode.insertBefore(node, anchorNode.childNodes[anchorOffset]);
      anchorNode = node;
      anchorOffset = 0;
    }

    if (focusNode.nodeType === Node.ELEMENT_NODE) {
      const node = document.createTextNode('');
      focusNode.insertBefore(node, focusNode.childNodes[focusOffset]);
      focusNode = node;
      focusOffset = 0;
    }

    let foundAnchor = false;
    let foundFocus = false;
    let characterCount = 0;
    let anchorIndex = 0;
    let focusIndex = 0;
    let preceedingText = '';
    let selectedText = '';
    let followingText = '';

    /**
     * Traverse the editor element's children depth first (visiting child nodes in-order) counting
     * characters until we find the anchor and focus nodes. We always standardize the selection back
     * to <text, anchorOffset, focusOffsete> | 'none' tuples. This is because we can reason about
     * what should happen to these values in the case of typical text editing operations. Doing so
     * allows us to always reason about the selection in terms of the text content of the editor
     * element instead of the DOM nodes.
     */
    visit(element, el => {
      const elText = el.nodeType === Node.TEXT_NODE ? el.nodeValue ?? '' : '';
      characterCount += elText.length;
      // allText += elText;

      if (el === anchorNode && el === focusNode) {
        if (foundAnchor || foundFocus)
          throw new Error('Found multiple anchor or focus nodes in selection');

        anchorIndex = characterCount - elText.length + anchorOffset;
        focusIndex = characterCount - elText.length + focusOffset;
        foundAnchor = true;
        foundFocus = true;
        const min = Math.min(anchorOffset, focusOffset);
        const max = Math.max(anchorOffset, focusOffset);
        preceedingText = preceedingText + elText.slice(0, min);
        selectedText = elText.slice(min, max);
        followingText = elText.slice(max, elText.length);
      } else if (el === anchorNode) {
        if (foundAnchor) throw new Error('Found multiple anchor nodes in selection');

        anchorIndex = characterCount - elText.length + anchorOffset;
        foundAnchor = true;
        if (!foundFocus) {
          // "forward" direction.
          preceedingText += elText.slice(0, anchorOffset);
          selectedText = elText.slice(anchorOffset);
        } else {
          // "backwards" direction.
          followingText = elText.slice(anchorOffset);
          selectedText += elText.slice(0, anchorOffset);
        }
      } else if (el === focusNode) {
        if (foundFocus) throw new Error('Found multiple focus nodes in selection');

        focusIndex = characterCount - elText.length + focusOffset;
        foundFocus = true;
        if (!foundAnchor) {
          // "backwards" direction.
          preceedingText += elText.slice(0, focusOffset);
          selectedText = elText.slice(focusOffset);
        } else {
          // "forward" direction.
          selectedText += elText.slice(0, focusOffset);
          followingText = elText.slice(focusOffset);
        }
      } else {
        if (!foundAnchor && !foundFocus) {
          preceedingText += elText;
        } else if (foundAnchor !== foundFocus) {
          selectedText += elText;
        } else {
          followingText += elText;
        }
      }
      return 'continue';
    });

    if (Package.environment === 'DEVELOPMENT') {
      if (anchorIndex <= focusIndex) {
        if (preceedingText.length !== anchorIndex) {
          throw new Error('preceedingText length does not match anchorIndex');
        }
        if (followingText.length !== content.length - focusIndex) {
          throw new Error('followingText length does not match focusIndex');
        }
      } else {
        if (preceedingText.length !== focusIndex) {
          throw new Error('preceedingText length does not match focusIndex');
        }
        if (followingText.length !== content.length - anchorIndex) {
          throw new Error('followingText length does not match anchorIndex');
        }
      }
    }

    const result = new TextDocument(
      anchorIndex,
      focusIndex,
      preceedingText + selectedText + followingText
    );
    return result;
  }

  /**
   * Programmatically set the selection in the editor element.
   *
   * @param textDocument The text document describing the selection.
   */
  writeSelection(textDocument: TextDocument) {
    if (Package.environment === 'DEVELOPMENT') {
      // skipcq: JS-0002: Avoid console
      console.log(' ✏️ Writing Selection to DOM');
    }

    const initialTextContent = this.element.textContent ?? ''.replaceAll('\r\n', '\n');
    const newDocumentTextContent = textDocument.text.replaceAll('\r\n', '\n');

    if (initialTextContent !== newDocumentTextContent) {
      this.element.textContent = newDocumentTextContent;
      // throw new Error('Text content does not match');
    }
    let characterCount = 0;

    let anchorNode: Node | undefined;
    let anchorOffset = 0;

    let focusNode: Node | undefined;
    let focusOffset = 0;

    let preceedingText = '';
    let selectedText = '';
    let followingText = '';

    let allText = '';

    const startingIndex = textDocument.preceedingText.length;
    const endingIndex = startingIndex + textDocument.selectedText.length;

    visit(this.element, el => {
      const elText = el.nodeType === Node.TEXT_NODE ? el.nodeValue ?? '' : '';

      characterCount += elText.length;
      allText += elText;

      if (
        characterCount >= startingIndex &&
        characterCount >= endingIndex &&
        !anchorNode &&
        !focusNode
      ) {
        if (textDocument.dir === '->') {
          anchorNode = el;
          anchorOffset = elText.length - (characterCount - startingIndex);
          focusNode = el;
          focusOffset = elText.length - (characterCount - endingIndex);
        } else {
          anchorNode = el;
          anchorOffset = elText.length - (characterCount - endingIndex);
          focusNode = el;
          focusOffset = elText.length - (characterCount - startingIndex);
        }
        preceedingText = allText.slice(0, startingIndex);
        selectedText = allText.slice(startingIndex, endingIndex);
        if (Package.environment === 'DEVELOPMENT') {
          if (preceedingText !== textDocument.preceedingText) {
            throw new Error(
              'Preceeding text did not match; your selection is out of date and invalid.'
            );
          }
          if (selectedText !== textDocument.selectedText) {
            throw new Error(
              'Selected text did not match; your selection is out of date and invalid.'
            );
          }
        }
      } else if (characterCount >= startingIndex && !anchorNode && !focusNode) {
        if (textDocument.dir === '->') {
          anchorNode = el;
          anchorOffset = elText.length - (characterCount - startingIndex);
        } else {
          focusNode = el;
          focusOffset = elText.length - (characterCount - startingIndex);
        }
        preceedingText = allText.slice(0, startingIndex);
        if (Package.environment === 'DEVELOPMENT') {
          if (preceedingText !== textDocument.preceedingText) {
            throw new Error(
              'Preceeding text did not match; your selection is out of date and invalid.'
            );
          }
        }
      } else if (characterCount >= endingIndex && (!focusNode || !anchorNode)) {
        if (textDocument.dir === '->') {
          focusNode = el;
          focusOffset = elText.length - (characterCount - endingIndex);
        } else {
          anchorNode = el;
          anchorOffset = elText.length - (characterCount - endingIndex);
        }
        selectedText = allText.slice(startingIndex, endingIndex);
        if (Package.environment === 'DEVELOPMENT') {
          if (selectedText !== textDocument.selectedText) {
            throw new Error(
              'Selected text did not match; your selection is out of date and invalid.'
            );
          }
        }
      }

      return 'continue';
    });
    followingText = allText.slice(endingIndex);

    if (textDocument.selectionType !== 'none' && (!anchorNode || !focusNode)) {
      throw new Error('Could not find anchor or focus node.');
    }

    if (Package.environment === 'DEVELOPMENT') {
      validateExpectations(textDocument, preceedingText, selectedText, followingText, allText);
    }

    if (anchorNode && focusNode) {
      const selection = this.getRawSelection();
      const anchorNodeEl = uneditable(anchorNode, this.element);
      if (anchorNodeEl) {
        const node = document.createTextNode('');
        anchorNodeEl.parentNode?.insertBefore(node, anchorNodeEl);
        anchorNode = node;
        anchorOffset = 0;
      }
      const focusNodeEl = uneditable(focusNode, this.element);
      if (focusNodeEl) {
        const node = document.createTextNode('');
        focusNodeEl.parentNode?.insertBefore(node, focusNodeEl);
        focusNode = node;
        focusOffset = 0;
      }
      selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    }
  }
}

/**
 * Performs validations in DEVELOPMENT mode to ensure that the selection is still valid.
 *
 * @param textDocument The passed text document
 * @param preceedingText The text before the selection
 * @param selectedText The newly selected text
 * @param followingText The text after the selection
 * @param allText The text of the entire element
 */
function validateExpectations(
  textDocument: TextDocument,
  preceedingText: string,
  selectedText: string,
  followingText: string,
  allText: string
) {
  if (preceedingText !== textDocument.preceedingText) {
    throw new Error('Preceeding text did not match; your selection is out of date and invalid.');
  }
  if (selectedText !== textDocument.selectedText) {
    throw new Error('Selected text did not match; your selection is out of date and invalid.');
  }
  if (followingText !== textDocument.followingText) {
    throw new Error('Following text did not match; your selection is out of date and invalid.');
  }
  if (
    allText !==
    textDocument.preceedingText + textDocument.selectedText + textDocument.followingText
  ) {
    throw new Error('All text did not match; your selection is out of date and invalid.');
  }
}

/**
 * A generic depth-first tree traversal function.
 *
 * @param element The element to begin traversing from.
 * @param visitor A function that is called for each node in the tree.
 */
function visit(element: HTMLElement, visitor: (el: Node) => 'stop' | 'continue') {
  const queue: Node[] = [];

  if (element.firstChild) queue.push(element.firstChild);

  let el = queue.pop();

  while (el) {
    if (visitor(el) === 'stop') break;

    if (el.nextSibling) queue.push(el.nextSibling);
    if (el.firstChild) queue.push(el.firstChild);

    el = queue.pop();
  }
}

/**
 * Searches up the DOM tree for the first element that is not editable.
 *
 * @param node The node to start searching from.
 * @param root The root node to stop searching at.
 * @returns The found element or undefined if none was found.
 */
function uneditable(node: Node, root: Node): Element | null {
  let searchingNode: Node | null = node;
  while (searchingNode && searchingNode !== root) {
    if (searchingNode.nodeType === Node.ELEMENT_NODE) {
      const el = searchingNode as Element;
      if (el.getAttribute('contenteditable') === 'false') {
        return el;
      }
    }
    searchingNode = searchingNode.parentNode;
  }
  return null;
}
