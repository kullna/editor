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

import {TextDocument} from './text_document';

/** A convenience class that aids in the construction of a `TextDocument` instance. */
export class MutableTextDocument {
  /** Represents the index where the selection starts. */
  anchorIndex: number = -1;

  /** Represents the index where the selection ends. */
  focusIndex: number = -1;

  /** Contains the full text content of the document. */
  text: string = '';

  /** Total number of lines in the document. */
  totalLines: number = 1;

  /** Represents the line number where the selection starts. */
  startSelectionLine: number = 0;

  /** Represents the line number where the selection ends. */
  endSelectionLine: number = 0;

  /**
   * Indicates if there's no active selection in the document.
   *
   * @returns `true` if there's no active selection, `false` otherwise.
   */
  get noSelection(): boolean {
    return this.anchorIndex === -1 && this.focusIndex === -1;
  }

  /**
   * Converts the mutable document representation to a more fixed `TextDocument` instance.
   *
   * @returns A new `TextDocument` instance containing the same details as the mutable
   *   representation.
   */
  toTextDocument(): TextDocument {
    return new TextDocument(
      this.anchorIndex,
      this.focusIndex,
      this.text,
      this.noSelection,
      this.totalLines,
      this.startSelectionLine,
      this.endSelectionLine
    );
  }
}
