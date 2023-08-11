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
 * Input processors are functions that control how
 * the editor responds to textual input. They have the ability to mutate the editor's code and
 * selection state, and to prevent the default behavior from executing.
 *
 * Processors can be used to insert additional text and control the cursor; which makes implementing
 * a wide variety of behaviors possible. For example, the default tab processor inserts spaces when
 * the tab key is pressed, and the default newline processor inserts a newline and indents the
 * cursor to the same level as the previous line.
 *
 * **There are some functions the editor performs that are not controlled by input processors:**
 *
 * - **Undo/Redo**: The editor maintains its own undo/redo stack and handles undo/redo events
 *   internally, and it captures the `Ctrl+Z` and `Ctrl+Shift+Z` key combinations to trigger these.
 * - **Cut/Paste**: The editor captures the `Ctrl+X` and `Ctrl+V` key combinations to trigger these.
 *
 * But most other functions are controlled by input processors.
 *
 * We call a sequence of input processors a **pipeline**. The pipeline is executed in order, and
 * each processor has the ability to prevent the default behavior from executing. If a processor
 * claims to have handled the event, the pipeline stops executing and the default behavior is
 * prevented. If a processor does not claim to have handled the event, the next processor in the
 * pipeline is executed.
 *
 * There are three built-in types of input processors that are used in the default configuration of the
 * keydown pipeline:
 *
 * - `BracketProcessor` - Handles bracket pairs, such as `()`, `[]`, and `{}`.
 * - `TabProcessor` - Handles inserting the correct tab character(s) when the `Tab` key is pressed, and
 *    handles the `Shift+Tab` key combination. Works for both a cursor and a range selection
 *    (including ranges over multiple-lines).
 * - `EnterProcessor` - Handles inserting a newline and indenting the cursor to the same level as the
 *   previous line.
 *
 * Please see {@link DefaultProcessors} for more information.
 *
 * **All Input Processors receive two parameters:**
 *
 * - `document: TextDocument` - Allows processors to produce a modified document.
 * - `args: InputProcessorArgs` - Arguments which include `event: TextEditorViewKeyboardEvent` which
 *   contains the key that was pressed, the key code, and other information.
 *
 * Please see {@link TextDocument} for more information about the text document API. Please see
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
 *     TextDocument,
 *     InputProcessor
 * } from '@kullna/editor';
 *
 * export interface MyOptions {
 *     // ... Create an interface for your options ...
 * }
 *
 * // Create a function that returns an InputProcessor:
 * export function createMyProcessor(options: MyOptions): InputProcessor {
 *     return (document: TextDocument, args: InputProcessorArgs): TextDocument | undefined | null => {
 *         // ... Use the Editor to manipulate the code and selection ...
 *         // ... If you've handled the event, mark it as handled:
 *         args.handled = true;
 *         return document.type('\n');
 *         // ... If you still want the event to be handled by the editor, leave it as false...
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
 *     // ... Register your processor ...
 *     keydown: [ createMyProcessor({ /* options * / }) ]
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
