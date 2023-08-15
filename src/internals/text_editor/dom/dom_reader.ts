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
    instance.document.text = instance.compute();
    instance.document.totalLines = null;
    instance.document.startSelectionLine = null;
    instance.document.endSelectionLine = null;

    return instance.document.toTextDocument();
  }

  /**
   * Processes the DOM to extract text content and any selection details.
   *
   * @returns The text content of the DOM.
   */
  private compute(): string {
    const selection = this.safeSelection();
    return this.extractSelectionFromDOM(selection);
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
    return this.window.getSelection() ?? null;
  }

  /**
   * Extracts selection details from the DOM based on the provided browser selection. It updates
   * internal counters and flags depending on the text nodes encountered and their relationship with
   * the selection range.
   *
   * @param selection - The browser selection to extract details from.
   * @returns The text content of the DOM.
   */
  private extractSelectionFromDOM(selection: Selection | null): string {
    const textParts: string[] = [];

    /**
     * A recursive DFT function to process a DOM node and its children.
     *
     * @param el The DOM node to process.
     */
    const processNode = (el: Node) => {
      let elText = el.nodeValue ?? '';
      elText = elText.replace(/\r|\n/g, '');
      const isAnchorNode = !selection ? false : selection.anchorNode === el;
      const isFocusNode = !selection ? false : selection.focusNode === el;

      if (el.nodeType === Node.TEXT_NODE) {
        textParts.push(elText);

        const anchorOffset = isAnchorNode && selection ? selection.anchorOffset : -1;
        const focusOffset = isFocusNode && selection ? selection.focusOffset : -1;

        if (anchorOffset >= 0 && anchorOffset <= elText.length) {
          this.document.anchorIndex = this.textLength + anchorOffset;
        }

        if (focusOffset >= 0 && focusOffset <= elText.length) {
          this.document.focusIndex = this.textLength + focusOffset;
        }

        this.textLength += elText.length;
      } else if (el.nodeName.toUpperCase() === 'BR') {
        textParts.push('\n');
        this.textLength += 1;

        if (selection) {
          if (isAnchorNode) {
            this.document.anchorIndex = this.textLength;
          }
          if (isFocusNode) {
            this.document.focusIndex = this.textLength;
          }
        }
      } else if (
        el.nodeName.toUpperCase() === 'DIV' ||
        (el.nodeName.toUpperCase() === 'SPAN' &&
          (el as HTMLElement).className === 'text-document-line')
      ) {
        el.childNodes.forEach(child => {
          processNode(child);
        });
        if (selection) {
          if (isAnchorNode) {
            this.document.anchorIndex = this.textLength - 1;
          }
          if (isFocusNode) {
            this.document.focusIndex = this.textLength - 1;
          }
        }
      } else {
        el.childNodes.forEach(child => {
          processNode(child);
        });
      }
    };

    processNode(this.element);

    return textParts.join('');
  }
}
