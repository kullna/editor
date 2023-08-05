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

import {type TextDocument, type TextEditorKeyboardEvent} from '../text_editor';

/**
 * # Input Processor
 *
 * An input processor is a function that contains logic to handle keyboard events. In the process of
 * handling these keyboard events, they can modify the user's document (e.g. by inserting text or
 * deleting text or moving the cursor).
 *
 * Input processors are used to implement features like tab completion, auto-indentation, and
 * automatic closing of brackets.
 *
 * They are expected to set `args.handled` to `true` if they handled the event and do not want it to
 * be propagated to other processors.
 *
 * Please see {@link Processors} for more information.
 *
 * @param selection The API for making changes in the editor.
 * @param event The keyboard event that triggered the processor.
 * @returns A modified document, or `undefined` if the processor did not modify the document.
 */
export type InputProcessor = (
  document: TextDocument,
  args: InputProcessorArgs
) => TextDocument | undefined;

/**
 * # Input Processor Arguments
 *
 * The arguments passed to an {@link InputProcessor}.
 *
 * Please see {@link Processors} for more information.
 */
export interface InputProcessorArgs {
  /**
   * Whether the processor handled the event.
   *
   * When `true` is returned, the event is not propagated to other processors.
   */
  handled: boolean;

  /**
   * The keyboard event that triggered the processor.
   *
   * @remarks
   *   This field contains the key that was pressed, the key code, and other information. So if you're
   *   building an input processor that needs to know what key was pressed, you can access that
   *   information here.
   */
  event: TextEditorKeyboardEvent;
}
