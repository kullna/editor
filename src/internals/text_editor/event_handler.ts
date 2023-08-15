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

import {type TextEditorViewKeyboardEvent} from './keyboard_event';
import {TextDocument} from './text_document';

/**
 * When an `EditorDOMEventHandler` categorizes an event from the DOM, it will call the corresponding
 * method on this interface. There are three general categories of events:
 *
 * - Clipboard Events
 * - Special Keyboard Events
 * - Undo/Redo
 * - Scrolling
 * - Selection Changes
 *
 * The method names are all imperative verbs because they are intended to be commands to the editor.
 */
export interface TextEditorViewEventHandler {
  /**
   * Called when the user presses the "cut" key combination.
   *
   * @param event The clipboard event.
   */
  cut(event: ClipboardEvent): void;

  /**
   * Called when the user presses the "paste" key combination.
   *
   * @param event The clipboard event.
   */
  paste(event: ClipboardEvent): void;

  /** Called when the user presses the "undo" key combination. */
  undo(): void;

  /** Called when the user presses the "redo" key combination. */
  redo(): void;

  /**
   * Called when the user is about to insert text. If clients want to prevent the default behavior,
   * they should call `event.preventDefault()`. This will prevent the text from being inserted. If
   * clients want to insert different text, they should call `insertText(text)` with the text they
   * want to insert then call `event.preventDefault()`.
   *
   * @returns Whether the default behavior should be prevented.
   */
  keydown(event: TextEditorViewKeyboardEvent): boolean;

  /** Called when the user releases a key. */
  keyup(event: TextEditorViewKeyboardEvent): boolean;

  /**
   * Called when the selection changes.
   *
   * @param document The document that was changed.
   */
  selectionChanged(document: TextDocument): void;

  /**
   * Called when the content changes.
   *
   * @param document The document that was changed.
   */
  contentChanged(document: TextDocument): void;

  /**
   * Called when the user scrolls the editor.
   *
   * @param element The element that was scrolled.
   */
  scroll(element: HTMLElement): void;
}
