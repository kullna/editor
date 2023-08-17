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

import {TextDocument} from '../text_document';

/**
 * Writes the current document to the DOM.
 *
 * @param element The element to write to.
 * @param doc The document to write.
 */
export function documentToDom(element: HTMLElement, doc: TextDocument): void {
  new DocumentToDomWriter(element, doc).write();
}

/** Writes a TextDocument to the DOM. */
class DocumentToDomWriter {
  constructor(
    private readonly element: HTMLElement,
    private readonly document: TextDocument
  ) {}

  /** Writes the document to the DOM. */
  write(): void {
    // Store initial scroll position
    const scrollPosition = {top: this.element.scrollTop, left: this.element.scrollLeft};

    this.element.innerHTML = ''; // Clear existing content
    const lines = this.document.text.split('\n');
    if (this.document.text.endsWith('\n')) {
      lines.pop();
    }

    let position = 0;
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      // Danger, don't ever allow the selection to be inclusive of the position
      // to the right of the new line position. That position is owned by the
      // next line.
      const startsOnLine = inInclusiveRange(
        this.document.earliestIndex,
        position,
        position + currentLine.length
      );

      const endsOnLine = inInclusiveRange(
        this.document.latestIndex,
        position,
        position + currentLine.length
      );

      // We always add a newline to the end of our lines! ... er... unless
      // they are the last line... mostly.
      const hasNewLine = i < lines.length - 1 || this.document.text.endsWith('\n');

      const safeEarliest = Math.max(this.document.earliestIndex, position);
      const safeLatest = Math.max(this.document.latestIndex, position);

      this.handleLine(
        startsOnLine,
        endsOnLine,
        currentLine,
        safeEarliest,
        position,
        safeLatest,
        hasNewLine
      );

      if (hasNewLine) {
        position += currentLine.length + 1; // Add 1 for the line break
      }

      // If the last character of the document is a newline, add an empty line without a newline at the end.
      if (i === lines.length - 1 && this.document.text.endsWith('\n')) {
        this.handleLine(
          safeEarliest === position,
          safeLatest === position,
          ' ',
          safeEarliest,
          position,
          safeLatest,
          false
        );
      }
    }

    if (this.document.selectionType !== 'none') {
      this.updateSelection();
    }

    // Restore scroll position
    this.element.scrollTop = scrollPosition.top;
    this.element.scrollLeft = scrollPosition.left;
  }

  // --------

  private _selectionBeginsInElement: Node | null = null;
  private _selectionBeginsAtOffset: number = 0;

  private _selectionEndsInElement: Node | null = null;
  private _selectionEndsAtOffset: number = 0;

  /**
   * Determines how to deal with the selection in a line, and eventually writes it to the DOM.
   *
   * @param startsOnLine True if the selection starts on this line.
   * @param endsOnLine True if the selection ends on this line.
   * @param currentLine The text of the line to write.
   * @param safeEarliest The earliest index of the selection in the document.
   * @param position The position of the line in the document.
   * @param safeLatest The latest index of the selection in the document.
   * @param hasNewLine True if the line has a newline at the end.
   */
  private handleLine(
    startsOnLine: boolean,
    endsOnLine: boolean,
    currentLine: string,
    safeEarliest: number,
    position: number,
    safeLatest: number,
    hasNewLine: boolean
  ) {
    if (startsOnLine && endsOnLine) {
      const startPart = currentLine.slice(0, safeEarliest - position);
      const selectionPart = currentLine.slice(safeEarliest - position, safeLatest - position);
      const endPart = currentLine.slice(safeLatest - position);
      this._writeSelectionBeginsAndEndsLine(startPart, selectionPart, endPart, hasNewLine);
    } else if (startsOnLine) {
      const startPart = currentLine.slice(0, safeEarliest - position);
      const endPart = currentLine.slice(safeEarliest - position);
      this._writeSelectionBeginsLine(startPart, endPart, hasNewLine);
    } else if (endsOnLine) {
      const startPart = currentLine.slice(0, safeLatest - position);
      const endPart = currentLine.slice(safeLatest - position);
      this._writeSelectionEndsLine(startPart, endPart, hasNewLine);
    } else if (inInclusiveRange(position, safeEarliest, safeLatest + 1)) {
      this._writeSelectedLine(currentLine, hasNewLine);
    } else if (position < safeEarliest) {
      this._writeLineBeforeSelection(currentLine, hasNewLine);
    } else if (position > safeLatest) {
      this._writeLineAfterSelection(currentLine, hasNewLine);
    }
  }

  /**
   * Constructs a new DOM element for a line and adds it to the DOM.
   *
   * @param line The text of the line to add.
   * @param withBreak Whether or not to add a line break after the line.
   * @returns The element that was added to the DOM.
   */
  private _addLine(line: string, withBreak: boolean): HTMLElement {
    const lineContainer = document.createElement('span');
    lineContainer.className = 'text-document-line';
    lineContainer.appendChild(window.document.createTextNode(line));
    if (withBreak) {
      lineContainer.appendChild(document.createElement('br')); // Add the line break
    }
    this.element.appendChild(lineContainer);
    return lineContainer;
  }

  /**
   * Writes a line that occurs before the selection begins.
   *
   * @param text The text of the line to write.
   * @param withBreak Whether or not to add a line break after the line.
   */
  private _writeLineBeforeSelection(text: string, withBreak: boolean) {
    this._addLine(text, withBreak);
  }

  /**
   * Writes a line that occurs after the selection ends.
   *
   * @param text The text of the line to write.
   * @param withBreak Whether or not to add a line break after the line.
   */
  private _writeLineAfterSelection(text: string, withBreak: boolean) {
    this._addLine(text, withBreak);
  }

  /**
   * Writes a line that is entirely selected.
   *
   * @param text The text of the line to write.
   * @param withBreak Whether or not to add a line break after the line.
   */
  private _writeSelectedLine(text: string, withBreak: boolean) {
    this._addLine(text, withBreak);
  }

  /**
   * Writes a line that contains the beginning of the selection (but not the end).
   *
   * @param start The text before the selection.
   * @param end The text after the selection.
   * @param withBreak Whether or not to add a line break after the line.
   */
  private _writeSelectionBeginsLine(start: string, end: string, withBreak: boolean) {
    this._selectionBeginsInElement = this._addLine(start + end, withBreak).childNodes[0];
    this._selectionBeginsAtOffset = start.length;
  }

  /**
   * Writes a line that contains the end of the selection (but not the beginning).
   *
   * @param start The text before the selection ends.
   * @param end The text after the selection ends.
   * @param withBreak Whether or not to add a line break after the line.
   */
  private _writeSelectionEndsLine(start: string, end: string, withBreak: boolean) {
    this._selectionEndsInElement = this._addLine(start + end, withBreak).childNodes[0];
    this._selectionEndsAtOffset = start.length;
  }

  /**
   * Writes a line that contains both the beginning and end of the selection.
   *
   * @param start The text before the selection.
   * @param selection The text that is selected.
   * @param end The text after the selection.
   * @param withBreak Whether or not to add a line break after the line.
   */
  private _writeSelectionBeginsAndEndsLine(
    start: string,
    selection: string,
    end: string,
    withBreak: boolean
  ) {
    this._selectionBeginsInElement = this._addLine(
      start + selection + end,
      withBreak
    ).childNodes[0];
    this._selectionBeginsAtOffset = start.length;
    this._selectionEndsInElement = this._selectionBeginsInElement;
    this._selectionEndsAtOffset = start.length + selection.length;
  }

  /** Updates the selection on the document based on the anchor and focus text nodes. */
  private updateSelection() {
    if (!this._selectionBeginsInElement || !this._selectionEndsInElement) {
      throw new Error('Selection begins and ends elements must be set.');
    }

    const selection = window.getSelection();

    if (!selection) {
      return;
    }

    if (!this._selectionBeginsInElement || !this._selectionEndsInElement) {
      throw new Error('Selection begins and ends elements must be set.');
    }

    if (this.document.anchorIndex <= this.document.focusIndex) {
      selection.setBaseAndExtent(
        this._selectionBeginsInElement,
        this._selectionBeginsAtOffset,
        this._selectionEndsInElement,
        this._selectionEndsAtOffset
      );
    } else {
      selection.setBaseAndExtent(
        this._selectionEndsInElement,
        this._selectionEndsAtOffset,
        this._selectionBeginsInElement,
        this._selectionBeginsAtOffset
      );
    }
  }
}

/**
 * Determines if the given index is in the range [from, to].
 *
 * @param index The index to check.
 * @param from The start of the range.
 * @param to The end of the range.
 * @returns True if the index is in the range, false otherwise.
 */
function inInclusiveRange(index: number, from: number, to: number): boolean {
  return from <= index && index <= to;
}
