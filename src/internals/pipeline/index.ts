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
 * Input processors are specialized functions designed to control and manage
 * how the editor responds to textual input. By enabling developers to define
 * and adjust the behavior of the editor in response to various inputs, processors
 * offer modularity and easy customization.
 *
 * This flexibility enables a wide range of editor behaviors. For instance, the default tab
 * processor inserts spaces when the tab key is pressed, while the newline processor
 * adds new lines and appropriately indents them.
 *
 * ## Not Controlled by Input Processors
 * **There are specific editor functionalities that remain autonomous and aren't influenced by input processors:**
 * - **Undo/Redo**: Managed internally by the editor's undo/redo stack. The combinations `Ctrl+Z` and `Ctrl+Shift+Z` trigger these actions.
 * - **Cut/Paste**: `Ctrl+X` and `Ctrl+V` are exclusively reserved for these actions.
 *
 * Apart from these, most interactive editor functionalities can be tailored using input processors.
 *
 * ## How Processors Work
 * Processors are organized in a sequence termed as a **pipeline**. If a processor "claims to have handled the event" (by marking the event as "handled" with `args.handled = true`),
 * subsequent processors in the pipeline are bypassed, overriding the default behavior.
 *
 * A processor's primary function is to transform the document and selection.
 * They take as a parameter the current document and the input event details,
 * and may return a new document or `undefined`/`null` (either of which indicate the processor
 * did not modify the document).
 *
 * {@link Text.TextDocument}s are immutable, so processors must return a new document
 * if they modify the document. If a processor does not modify the document, it
 * should return `undefined` or `null`.
 *
 * The {@link Text.TextDocument} API can be used to create new {@link Text.TextDocument} instances.
 * These APIs are cursor-centric and allow for easy manipulation of the document.
 *
 * ## Default Processors
 * The editor's default configuration includes three input processors:
 * - `BracketProcessor`
 * - `TabProcessor`
 * - `EnterProcessor`
 *
 * Detailed explanations are available at {@link DefaultProcessors}.
 *
 * ## Processor Parameters
 * Every input processor accepts two parameters:
 * - `document: TextDocument` - Allowing processors to produce an altered document.
 * - `args: InputProcessorArgs` - Contains the input event details, encapsulated within `event: TextEditorViewKeyboardEvent`.
 *
 * More insights are available at {@link TextDocument} and {@link InputProcessorArgs}.
 *
 * ## Developing a Custom Input Processor
 * Custom input processors provide an avenue for developers to implement unique or specific behaviors. Imagine needing an input processor that aids in auto-formatting code or one that integrates specific keyboard shortcuts.
 *
 * Here's a foundational template for crafting an input processor:
 *
 * ```js
 * import {
 *     InputProcessorArgs,
 *     TextDocument,
 *     InputProcessor
 * } from '@kullna/editor';
 *
 * export interface MyOptions {
 *     // Define your option parameters here...
 * }
 *
 * // Function to craft a custom InputProcessor:
 * export function createMyProcessor(options: MyOptions): InputProcessor {
 *     return (document: TextDocument, args: InputProcessorArgs): TextDocument | undefined | null => {
 *         // Manipulate code and selection using the Editor API...
 *         // Mark the event as "handled" if addressed:
 *         args.handled = true;
 *         // Here, returning the document after typing a newline:
 *         return document.type('\n');
 *         // You can also return undefined or null based on specific conditions.
 *         // This can influence the subsequent behavior of the editor.
 *     };
 * }
 * ```
 * (Note: In the above template, the processor can return `TextDocument`, `undefined`, or `null`. The choice of return type can influence how subsequent processors or default behaviors are triggered.)
 *
 * After creating your input processor, register it with the editor:
 *
 * ```js
 * import {
 *     createMyProcessor
 * } from './my-processor';
 * ...
 * const editor = KullnaEditor.createEditor(element, {
 *     // Configuration...
 *     language: 'javascript',
 *     highlight: hljs.highlightElement,
 *     keydown: [ createMyProcessor({ options }) ]
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
