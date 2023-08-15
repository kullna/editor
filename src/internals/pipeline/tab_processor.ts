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

import {InputProcessor, InputProcessorArgs} from './input_processor';
import {TextDocument} from '../text_editor';

/**
 * # Tab Processor Options
 *
 * The `TabProcessorOptions` interface specifies the options that can be passed to the default tab
 * processor.
 *
 * Please see {@link Processors} for more information.
 */
export interface TabProcessorOptions {
  /**
   * The `tab` option specifies the string that is inserted when the user presses the tab key.
   *
   * **Default:** `' '` (two spaces)
   */
  tab: string;
}

/**
 * ### Tab Processor
 *
 * The default tab processor. This processor will insert or remove a tab character at the cursor
 * position, or indent or dedent the selected lines if the selection spans multiple lines.
 *
 * @param opts The options for the default tab processor.
 * @returns A new tab processor.
 */
export function tabProcessor(opts: Partial<TabProcessorOptions>): InputProcessor {
  const options = {
    tab: '  ',
    ...opts
  };

  /**
   * The default tab processor. This processor will insert or remove a tab character at the cursor
   * position, or indent or dedent the selected lines if the selection spans multiple lines.
   *
   * @param document The input document. See {@link InputProcessorArgs}
   * @param args The input arguments. See {@link InputProcessorArgs}
   * @returns Whether the processor handled the event.
   */
  return (document: TextDocument, args: InputProcessorArgs): TextDocument | undefined => {
    if (!args.event.isTab) return;
    args.handled = true;

    const shifted = args.event.isShift;

    const cursorMode = document.selectionType === 'caret';

    if (cursorMode && !shifted) {
      return document.insertText(options.tab);
    }

    document = document.expandToCoverLines();

    const selectedText = document.selectedText;
    const selectedLines = selectedText.split('\n');
    const lineCount = selectedLines.length;
    let insertedCharacters = 0;
    // If the shift key is being held, it's a dedent request.
    if (shifted) {
      for (let i = 0; i < lineCount; i++) {
        /**
         * We can only dedent lines that begin with some sort of whitespace. So we check for that
         * first, and never consume more characters than there is whitespace.
         */
        const match = /^\s+/.exec(selectedLines[i]);
        if (match !== null) {
          const leadingSpace = match[0];
          const originalLength = selectedLines[i].length;
          if (leadingSpace.length >= options.tab.length) {
            selectedLines[i] = selectedLines[i].slice(options.tab.length);
          } else if (leadingSpace.length > 0) {
            selectedLines[i] = selectedLines[i].slice(leadingSpace.length);
          }
          insertedCharacters = insertedCharacters + (selectedLines[i].length - originalLength);
        }
      }
    } else {
      insertedCharacters = lineCount * options.tab.length;
      for (let i = 0; i < lineCount; i++) {
        selectedLines[i] = options.tab + selectedLines[i];
      }
    }

    return document.insertText(selectedLines.join('\n'), false, true);
  };
}
