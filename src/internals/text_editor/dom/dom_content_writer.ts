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

  private inInclusiveRange(index: number, from: number, to: number): boolean {
    return from <= index && index <= to;
  }

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
      // Danger, don't ever allow the selection to be inclusive of the
      // ending fencepost of this line including the newline  or the cursor
      // will be in an invalid state for the DOM and won't work across
      // browsers reliably.)
      // Here, for the line "hello", it can be at index 5, but not 6.
      // 0h1e2l3l4o5\n6
      // Fortunately, the newline characters are gone as an artifact of
      // splitting the text into lines, so we don't have to worry about
      // adding one - but... don't be tempted to add one!
      // currentLine doesn't include the newlines at the end of each line.
      // So, here, we use position + currentLine.length (5 in the example above)
      // to determine if the selection is at the end of the line, and accept
      // any "earliest index" that is equal to or less than that.
      const startsOnLine = this.inInclusiveRange(
        this.document.earliestIndex,
        position,
        position + currentLine.length
      );

      const endsOnLine = this.inInclusiveRange(
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
    } else if (this.inInclusiveRange(position, safeEarliest, safeLatest + 1)) {
      this._writeSelectedLine(currentLine, hasNewLine);
    } else if (position < safeEarliest) {
      this._writeLineBeforeSelection(currentLine, hasNewLine);
    } else if (position > safeLatest) {
      this._writeLineAfterSelection(currentLine, hasNewLine);
    }
  }

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

  private _writeLineBeforeSelection(text: string, withBreak: boolean) {
    this._addLine(text, withBreak);
  }

  private _writeLineAfterSelection(text: string, withBreak: boolean) {
    this._addLine(text, withBreak);
  }

  private _writeSelectedLine(text: string, withBreak: boolean) {
    this._addLine(text, withBreak);
  }

  private _writeSelectionBeginsLine(start: string, end: string, withBreak: boolean) {
    this._selectionBeginsInElement = this._addLine(start + end, withBreak).childNodes[0];
    this._selectionBeginsAtOffset = start.length;
  }

  private _writeSelectionEndsLine(start: string, end: string, withBreak: boolean) {
    this._selectionEndsInElement = this._addLine(start + end, withBreak).childNodes[0];
    this._selectionEndsAtOffset = start.length;
  }

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
