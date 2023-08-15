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
 * A list of quotes. This is used to determine whether the user is typing a quote. All the
 * characters in this string should also be in `OPEN_BRACKETS` and `CLOSE_BRACKETS` (unless they are
 * directional pairs).
 */
const QUOTES = `"'`;

/** A list of opening brackets. */
const OPEN_BRACKETS = `([{'"`;

/** A list of closing brackets. */
const CLOSE_BRACKETS = `)]}'"`;

/**
 * ### Bracket Processor
 *
 * The default bracket processor. This processor is responsible for automatically inserting closing
 * brackets. It also handles "skipping over" closing brackets if they are already present.
 *
 * @returns A configured keydown processor.
 */
export function bracketProcessor(): InputProcessor {
  /**
   * The default bracket processor. This processor is responsible for automatically inserting
   * closing brackets. It also handles "skipping over" closing brackets if they are already
   * present.
   *
   * @param document The input document. See {@link InputProcessorArgs}
   * @param args The input arguments. See {@link InputProcessorArgs}
   * @returns Whether the processor handled the event.
   */
  return (document: TextDocument, args: InputProcessorArgs): TextDocument | undefined => {
    const keyCode = args.event.keyCode;
    const escapeCharacter = document.preceedingText.endsWith('\\');
    const charAfter = document.followingText.slice(0, 1);

    if (escapeCharacter) return;

    if (CLOSE_BRACKETS.includes(keyCode) && charAfter === keyCode) {
      // We already have closing char next to cursor. Move one char to right.
      args.handled = true;
      return document.skipCharacter();
    } else if (
      OPEN_BRACKETS.includes(keyCode) &&
      (QUOTES.includes(keyCode) || ['', ' ', '\n'].includes(charAfter))
    ) {
      // The logic above says; if the user typed a quote (and we know it's not escaped)
      // then, no matter what the next character is, we should insert the closing quote.
      // But, if it's not a quote, then we should only insert the closing character if the
      // next character is a space, newline, or nothing.
      args.handled = true;
      return document
        .insertText(keyCode, true, true)
        .insertText(CLOSE_BRACKETS[OPEN_BRACKETS.indexOf(keyCode)], false, false);
    }

    return;
  };
}
