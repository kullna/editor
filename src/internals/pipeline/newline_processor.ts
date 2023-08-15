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
 * # Newline Processor Options
 *
 * The `NewlineProcessorOptions` interface specifies the options that can be passed to the default
 * newline processor.
 *
 * Please see {@link Processors} for more information.
 */
export interface NewlineProcessorOptions {
  /**
   * The `indentOn` option specifies a regular expression that is used to determine whether the
   * editor should indent the new line further when the user presses the enter key.
   *
   * Usually this regex matches with opening brackets and parentheses. When the user presses newline
   * and the cursor immediately follows an open bracket, we want to indent the next line further.
   *
   * **Default:** `/[({[]$/`
   */
  incrementIndentationOn: RegExp;

  /**
   * The `moveToNewLine` option specifies a regular expression that is used to determine whether the
   * editor should move the text after the cursor to the beginning of the next line when the user
   * presses the enter key. This is used for closing brackets and parentheses when the user presses
   * enter and the next character is a closing bracket or parenthesis.
   *
   * **Default:** `/^[)}\]]/`
   */
  moveToNewLine: RegExp;

  /**
   * The `tab` option specifies the string that is inserted when the user presses the tab key. This
   * value is used by the newline processor to indent new lines which require additional indentation
   * correctly.
   *
   * **Default:** `' '` (two spaces)
   */
  tab: string;
}

/**
 * ### Newline Processor
 *
 * The default newline processor.
 *
 * This processor is used to handle the enter key. When the enter key is pressed, this processor
 * will insert a new line and optionally indent the new line appropriately. Sometimes it adjusts the
 * indentation up or down depending on the context. It's important to note that this processor
 * always inserts a new line. This is done because FireFox handles the enter key differently than
 * other browsers. In FireFox, the enter key inserts a <br> tag instead of a new line. This
 * processor is used to normalize the behavior across all browsers.
 *
 * @param opts The options for the default newline processor.
 * @returns A configured newline processor.
 */
export function newlineProcessor(opts: Partial<NewlineProcessorOptions>): InputProcessor {
  const options = {
    preserveIndentation: true,
    incrementIndentationOn: /[({[]$/,
    moveToNewLine: /^[)}\]]/,
    tab: '  ',
    ...opts
  };

  /**
   * The default enter processor.
   *
   * This processor is used to handle the enter key. When the enter key is pressed, this processor
   * will insert a new line and optionally indent the new line appropriately. Sometimes it adjusts
   * the indentation up or down depending on the context. It's important to note that this processor
   * always inserts a new line. This is done because FireFox handles the enter key differently than
   * other browsers. In FireFox, the enter key inserts a <br> tag instead of a new line. This
   * processor is used to normalize the behavior across all browsers.
   *
   * @param document The input document. See {@link InputProcessorArgs}
   * @param args The input arguments. See {@link InputProcessorArgs}
   * @returns The mutated document
   */
  return (document: TextDocument, args: InputProcessorArgs): TextDocument | undefined => {
    if (!args.event.isEnter) return;
    args.handled = true;

    const before = document.preceedingText;
    const after = document.followingText;
    const currentLine = document.preceedingText.split('\n').pop() ?? document.preceedingText;
    const matchResult = /^\s*/.exec(currentLine);
    const currentLinePadding = matchResult ? matchResult[0] : '';

    let newLinePadding = '';
    if (options.preserveIndentation) {
      newLinePadding = currentLinePadding;
      // If last symbol is "{" ident new line
      if (options.incrementIndentationOn.test(before)) {
        newLinePadding += options.tab ?? '\t';
      }
    }

    // Preserve padding
    document = document.insertText(`\n${newLinePadding}`);

    if (options.preserveIndentation) {
      // Place adjacent "}" on next line
      if (options.moveToNewLine.test(after)) {
        document = document.insertText(`\n${currentLinePadding}`, false, false);
      }
    }

    return document;
  };
}
