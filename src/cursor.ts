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

/**
 * The Position interface represents the position of the cursor on the page.
 */
export interface Position {
  top: string;
  left: string;
}

/**
 * Gets the current selection from the window, asserting that it exists.
 * @param element The element to get the selection for.
 * @returns The current selection.
 * @remarks There are limited cases where the selection may not exist, such as
 * when the user is not focused on the editor. In these cases, an error is
 * thrown. This function should only be used when the selection is guaranteed
 * to exist.
 */
function getSelection(element: HTMLElement) {
  if (!element.parentNode) {
    throw new Error('editor.parentNode is unexpectedly null');
  }
  if (element.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    const result = (element.parentNode as Document).getSelection();
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
 * Returns position of cursor on the page.
 * @param element DOM node.
 * @param toStart Position of beginning of selection or end of selection.
 */
function cursorPosition(element: HTMLElement, toStart?: boolean): Position | undefined {
  const selection = getSelection(element);
  if (selection.rangeCount > 0) {
    const cursor = document.createElement('span');
    cursor.textContent = '|';

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(toStart);
    range.insertNode(cursor);

    const {x, y, height} = cursor.getBoundingClientRect();
    const top = `${window.scrollY + y + height}px`;
    const left = `${window.scrollX + x}px`;

    if (cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }

    return {top, left};
  }
  return undefined;
}

/**
 * Returns selected text.
 * @param element DOM node.
 * @returns Selected text.
 */
function selectedText(element: HTMLElement) {
  const selection = getSelection(element);
  if (selection.rangeCount === 0) return '';
  return selection.getRangeAt(0).toString();
}

/**
 * Returns text before the cursor.
 * @param element DOM node.
 * @returns Text before the cursor.
 */
function textBeforeCursor(element: HTMLElement) {
  const selection = getSelection(element);
  if (selection.rangeCount === 0) return '';

  const originalRange = selection.getRangeAt(0);
  const newRange = document.createRange();
  newRange.selectNodeContents(element);
  newRange.setEnd(originalRange.startContainer, originalRange.startOffset);
  return newRange.toString();
}

/**
 * Returns text after the cursor.
 * @param element Editor DOM node.
 * @returns Text after the cursor.
 */
function textAfterCursor(element: HTMLElement) {
  const selection = getSelection(element);
  if (selection.rangeCount === 0) return '';

  const originalRange = selection.getRangeAt(0);
  const newRange = document.createRange();
  newRange.selectNodeContents(element);
  newRange.setStart(originalRange.endContainer, originalRange.endOffset);
  return newRange.toString();
}

/**
 * The Cursor object provides methods to get information about the current
 * selection or cursor position in the editor.
 * @remarks This class is currently unused internally.
 */
export const Cursor = {
  getSelection,
  cursorPosition,
  selectedText,
  textBeforeCursor,
  textAfterCursor
};
