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
 * # Gutter Line Elements
 *
 * Each gutter line is composed of a wrapper, a line number span, and an accessory span.
 *
 * The wrapper is the element that wraps all of the children which, in total, represent a line
 * number in the gutter and their accessories.
 *
 * The two elements exist to help facilitate the styling of the gutter line. The line number span is
 * the element that hosts the actual line number text. The accessory span is basically designed to
 * be a place to put icons signifying a breakpoint or bookmark. The accessory span is also
 * positioned first in the wrapper so that it can be styled to be on the left side of the line
 * number in ltr languages and on the right side of the line number in rtl languages.
 *
 * For an overview of gutter customization, see {@link Gutters}.
 *
 * For examples of creating gutter line elements, see {@link GutterCustomizer}.
 */
export interface GutterLineElement {
  /** Wraps all of the children while, in total, represent a line number in the gutter. */
  gutterLineWrapper: HTMLElement;

  /** Hosts the actual line number text. */
  lineNumberSpan: HTMLElement;

  /**
   * The accessory span is basically designed to be a place to put icons signifying a breakpoint or
   * bookmark or whatever have you exist on that line.
   */
  accessorySpan: HTMLElement;
}
