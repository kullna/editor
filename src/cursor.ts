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

interface Position {
  top: string;
  left: string;
}

/**
 * The Cursor class provides methods to get information about the current
 * selection or cursor position in the editor.
 * @remarks This class is currently unused internally.
 */
export class Cursor {
  /**
   * Returns position of cursor on the page.
   * @param toStart Position of beginning of selection or end of selection.
   */
  static cursorPosition(toStart?: boolean): Position | undefined {
    const s = window.getSelection()!;
    if (s.rangeCount > 0) {
      const cursor = document.createElement('span');
      cursor.textContent = '|';

      const r = s.getRangeAt(0).cloneRange();
      r.collapse(toStart);
      r.insertNode(cursor);

      const {x, y, height} = cursor.getBoundingClientRect();
      const top = window.scrollY + y + height + 'px';
      const left = window.scrollX + x + 'px';
      cursor.parentNode!.removeChild(cursor);

      return {top, left};
    }
    return undefined;
  }

  /**
   * Returns selected text.
   */
  static selectedText() {
    const s = window.getSelection()!;
    if (s.rangeCount === 0) return '';
    return s.getRangeAt(0).toString();
  }

  /**
   * Returns text before the cursor.
   * @param editor Editor DOM node.
   */
  static textBeforeCursor(editor: Node) {
    const s = window.getSelection()!;
    if (s.rangeCount === 0) return '';

    const r0 = s.getRangeAt(0);
    const r = document.createRange();
    r.selectNodeContents(editor);
    r.setEnd(r0.startContainer, r0.startOffset);
    return r.toString();
  }

  /**
   * Returns text after the cursor.
   * @param editor Editor DOM node.
   */
  static textAfterCursor(editor: Node) {
    const s = window.getSelection()!;
    if (s.rangeCount === 0) return '';

    const r0 = s.getRangeAt(0);
    const r = document.createRange();
    r.selectNodeContents(editor);
    r.setStart(r0.endContainer, r0.endOffset);
    return r.toString();
  }
}
