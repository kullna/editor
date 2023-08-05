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
 * @packageDocumentation # Input Processors
 *
 * Input processors handle keyboard input from the user; like what happens when the tab or enter
 * keys are pressed.
 *
 * Processors can be used to insert additional text and control the cursor; which makes implementing
 * a wide variety of behaviors possible. For example, the default tab processor inserts spaces when
 * the tab key is pressed, and the default newline processor inserts a newline and indents the
 * cursor to the same level as the previous line. Input processors are functions that control how
 * the editor responds to textual input. They have the ability to mutate the editor's code and
 * selection state, and to prevent the default behavior from executing.
 *
 * **There are some functions the editor performs that are not controlled by input processors:**
 *
 * - **Undo/Redo**: The editor maintains its own undo/redo stack and handles undo/redo events
 *   internally, and it captures the `Ctrl+Z` and `Ctrl+Shift+Z` key combinations to trigger these.
 * - **Cut/Paste**: The editor captures the `Ctrl+X` and `Ctrl+V` key combinations to trigger these.
 *
 * **There are three types of input processors:**
 *
 * - `BracketProcessor` - Invoked whenever the user presses a key while the editor is focused and the
 *   key is not a special key (e.g. `Enter`, `Tab`, `Backspace`, etc.).
 * - `TabProcessor` - Invoked whenever the user presses the `Tab` key while the editor is focused.
 * - `EnterProcessor` - Invoked whenever the user presses the `Enter` key while the editor is focused.
 *
 * Please see {@link Processors} for more information.
 *
 * **All Input Processors receive two parameters:**
 *
 * - `editor: TextEditorView` - Allows processors to mutate the document or the cursor.
 * - `args: InputProcessorArgs` - Arguments which include `event: TextEditorKeyboardEvent` which
 *   contains the key that was pressed, the key code, and other information.
 *
 * Please see {@link TextEditorView} for more information about the editor API. Please see
 * {@link InputProcessorArgs} for more information about the arguments passed to processors.
 *
 * ## Developing an Input Processor
 *
 * **Here's a template for creating an input processor.** The template is the same no matter which
 * type of processor you're creating:
 *
 * ```js
 * import {
 *     InputProcessorArgs,
 *     TextEditorView,
 *     InputProcessor
 * } from '@kullna/editor';
 *
 * export interface MyOptions {
 *     // ... Create an interface for your options ...
 * }
 *
 * // Create a function that returns an InputProcessor:
 * export function createMyProcessor(options: MyOptions): InputProcessor {
 *     return (editor: TextEditorView, args: InputProcessorArgs): boolean => {
 *         // ... Use the Editor to manipulate the code and selection ...
 *         editor.type('\n');
 *         // ... If you've handled the event, return true ...
 *         return true;
 *         // ... If you still want the event to be handled by the editor, return false ...
 *     };
 * }
 * ```
 *
 * Once you've created your input processor, you can register it with the editor when you create it:
 *
 * ```js
 * import {
 *     createMyProcessor
 * } from './my-processor';
 * ...
 * const editor = KullnaEditor.createEditor(element, {
 *     // ... Editor options ...
 *     language = 'javascript',
 *     highlight: hljs.highlightElement,
 *     enterProcessor: {
 *          replacement: createMyProcessor({
 *                // ... Pass your options here ...
 *             })
 *    }
 * });
 * ```
 */
export {type InputProcessor, type InputProcessorArgs} from './input_processor';
export {type NewlineProcessorOptions} from './newline_processor';
export {type TabProcessorOptions} from './tab_processor';

import {newlineProcessor} from './newline_processor';
import {bracketProcessor} from './bracket_processor';
import {tabProcessor} from './tab_processor';

/**
 * # Default Input Processors
 *
 * These are the default {@link InputProcessor} implementations used by the editor.
 *
 * If you create your own input processor, you can still incorporate these processors into your own
 * processor. Please see {@link InputProcessor} for more information about Input Processors in
 * general.
 */
export const DefaultProcessors = {
  newlineProcessor,
  bracketProcessor,
  tabProcessor
};
