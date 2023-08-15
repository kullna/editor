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
  private anchorTextNode: Text | null = null;
  private focusTextNode: Text | null = null;
  private currentPosition = 0; // Keep track of the current position in the text.

  constructor(
    private readonly element: HTMLElement,
    private readonly doc: TextDocument
  ) {}

  /** Writes the document to the DOM. */
  write(): void {
    const scrollPosition = {top: this.element.scrollTop, left: this.element.scrollLeft};

    this.element.innerHTML = ''; // Clear existing content
    const lines = this.doc.text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      this.handleLine(currentLine);
      if (i !== lines.length - 1) {
        this.element.appendChild(document.createTextNode('\n')); // Add the newline character
      }
    }

    this.updateSelection();

    this.element.scrollTop = scrollPosition.top;
    this.element.scrollLeft = scrollPosition.left;
  }

  /**
   * Handles the creation and addition of a new line to the DOM element. Takes care of selections
   * within the line.
   *
   * @param {string} line - The line of text to be handled.
   */
  private handleLine(line: string): void {
    const lineContainer = document.createElement('span');
    lineContainer.className = 'text-document-line';

    // Determine if this line contains the start or end of the selection.
    const startsInThisLine =
      this.currentPosition <= this.doc.anchorIndex &&
      this.doc.anchorIndex <= this.currentPosition + line.length;
    const endsInThisLine =
      this.currentPosition <= this.doc.focusIndex &&
      this.doc.focusIndex <= this.currentPosition + line.length;

    if (
      startsInThisLine ||
      endsInThisLine ||
      (this.currentPosition > this.doc.anchorIndex &&
        this.currentPosition + line.length < this.doc.focusIndex)
    ) {
      const beforeStart = line.slice(0, this.doc.anchorIndex - this.currentPosition);
      const selectedPart = line.slice(
        this.doc.anchorIndex - this.currentPosition,
        this.doc.focusIndex - this.currentPosition
      );
      const afterEnd = line.slice(this.doc.focusIndex - this.currentPosition);

      lineContainer.appendChild(document.createTextNode(beforeStart));

      if (startsInThisLine) {
        this.anchorTextNode = document.createTextNode('');
        lineContainer.appendChild(this.anchorTextNode);
      }

      lineContainer.appendChild(document.createTextNode(selectedPart));

      if (endsInThisLine) {
        this.focusTextNode = document.createTextNode('');
        lineContainer.appendChild(this.focusTextNode);
      }

      lineContainer.appendChild(document.createTextNode(afterEnd));
    } else {
      lineContainer.innerText = line;
    }

    this.element.appendChild(lineContainer);

    // Account for the newline character
    this.currentPosition += line.length + 1;
  }

  /** Updates the selection on the document based on the anchor and focus text nodes. */
  private updateSelection() {
    if (this.anchorTextNode && this.focusTextNode) {
      const selection = window.getSelection();
      selection?.setBaseAndExtent(this.anchorTextNode, 0, this.focusTextNode, 0);
    }
  }
}
