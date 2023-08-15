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

import {MutableTextDocument} from '../mutable_text_document';
import {TextDocument} from '../text_document';

/**
 * Reads the DOM to extract a text document; the text of the DOM and the selection locations.
 *
 * @param window - The browser window object.
 * @param element - The HTML element from which the text document should be extracted.
 * @returns A tuple containing the `TextDocument` instance and an array of line metrics.
 */
export function domToDocument(window: Window, element: HTMLElement): TextDocument {
  const document = DomToDocumentReader.parse(window, element);
  return document;
}

/**
 * The `DomToDocumentReader` class is responsible for parsing an HTML element to extract a text
 * document, including details about the text and its selection.
 *
 * This class utilizes the `MutableTextDocument` for constructing a structured representation of the
 * parsed data.
 */
class DomToDocumentReader {
  private readonly document: MutableTextDocument = new MutableTextDocument();

  /** Accumulator for the length of text parsed. */
  private textLength = 0;
  /** Counter for lines up to the anchor index. */
  private firstEndLineCount = 0;
  /** Counter for lines between the anchor and focus index. */
  private secondEndLineCount = 0;
  /** Counter for lines after the focus index. */
  private afterFocusLineCount = 0;

  /**
   * Private constructor for the `DOMParser` class.
   *
   * @param window - The browser window object.
   * @param element - The HTML element from which the text document should be extracted.
   */
  private constructor(
    private readonly window: Window,
    private readonly element: HTMLElement
  ) {}

  /**
   * Factory method to create and utilize a `DomToDocumentReader` instance to extract text and
   * selection data.
   *
   * @param window - The browser window object.
   * @param element - The HTML element from which the text document should be extracted.
   * @returns A `TextDocument` representation of the parsed element.
   */
  static parse(window: Window, element: HTMLElement): TextDocument {
    const instance = new DomToDocumentReader(window, element);
    instance.compute();
    instance.document.text = instance.element.innerText ?? '';
    instance.document.totalLines =
      instance.firstEndLineCount + instance.secondEndLineCount + instance.afterFocusLineCount + 1;
    instance.document.startSelectionLine = instance.firstEndLineCount + 1;
    instance.document.endSelectionLine =
      instance.firstEndLineCount + instance.secondEndLineCount + 1;
    return instance.document.toTextDocument();
  }

  /** Processes the DOM to extract text content and any selection details. */
  private compute(): void {
    const selection = this.safeSelection();
    if (!selection) {
      this.textLength += (this.element.innerText ?? '').length;
      return;
    }
    this.extractSelectionFromDOM(selection);
  }

  /**
   * Safely retrieves the current selection from the DOM. Useful to prevent errors in fragmented DOM
   * scenarios.
   *
   * @returns The current browser selection or null if none exists.
   */
  private safeSelection(): Selection | null {
    if (
      this.element.parentNode &&
      this.element.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
      return (this.element.parentNode as Document).getSelection();
    }
    return this.window.getSelection() || null;
  }

  /**
   * Extracts selection details from the DOM based on the provided browser selection. It updates
   * internal counters and flags depending on the text nodes encountered and their relationship with
   * the selection range.
   *
   * @param selection - The browser selection to extract details from.
   */
  private extractSelectionFromDOM(selection: Selection): void {
    let afterFocus = false;
    let afterAnchor = false;
    let withinSelection = false;

    const processNode = (el: Node) => {
      const elText = el.nodeValue ?? '';
      const isAnchorNode = selection.anchorNode === el;
      const isFocusNode = selection.focusNode === el;

      if (el.nodeType === Node.TEXT_NODE) {
        // Note that this for loop extends one character past the end of the text node to account
        // for the selection being at the end of the text node, and it is careful about indexing
        // into the text node when the selection is at the end of the text node.
        // skipcq: JS-S1016
        for (let i = 0; i <= elText.length; i++) {
          const char = i < elText.length ? elText[i] : '';

          if (isAnchorNode && i === selection.anchorOffset) {
            this.document.anchorIndex = this.textLength + i;
            afterAnchor = true;
            withinSelection = !afterFocus;
          }

          if (isFocusNode && i === selection.focusOffset) {
            this.document.focusIndex = this.textLength + i;
            afterFocus = true;
            withinSelection = !afterAnchor;
          }

          if (char === '\n') {
            if (!(afterAnchor || afterFocus)) this.firstEndLineCount++;
            else if (withinSelection) this.secondEndLineCount++;
            else if (afterAnchor && afterFocus) this.afterFocusLineCount++;
          }
        }

        this.textLength += elText.length;
      }

      el.childNodes.forEach(child => {
        processNode(child);
      });
    };

    processNode(this.element);
  }
}
