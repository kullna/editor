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
 * # Text Document
 *
 * A Text Document is an immutable value type representing a string of text (the text document's
 * content) and a "selection" or "cursor".
 *
 * The selection (or cursor) is represented by an anchor and a focus index (both are indices into
 * the content string). The anchor index is the index of the side of the selection that was selected
 * first, and the focus index is the side of the selection that was selected last.
 *
 * You can use the factory methods to produce new Text Document instances with modified content or
 * changed selection.
 *
 * When you are done creating a `TextDocument`, you can update the `TextEditorView`'s, document.
 *
 * @see {@link TextEditorView} . {@link TextEditorView#document}
 */
export class TextDocument {
  /**
   * Creates a new `TextDocument` with the given content and selection.
   *
   * @param anchorIndex The index of the anchor of the selection.
   * @param focusIndex The index of the focus of the selection.
   * @param text The content of the text document.
   * @param noSelection Whether or not the selection is active.
   */
  constructor(
    readonly anchorIndex: number,
    readonly focusIndex: number,
    readonly text: string,
    private readonly noSelection: boolean = false
  ) {}

  /**
   * The direction of the selection (or cursor). `->` means the selection is from left to right.
   * `<-` means the selection is from right to left.
   *
   * TODO: DELETE THIS
   *
   * @returns A string representing the direction of the selection.
   */
  get dir(): '->' | '<-' {
    return this.anchorIndex <= this.focusIndex ? '->' : '<-';
  }

  /**
   * Returns the type of selection that is currently active. `none` means no selection is active.
   * `caret` means a single position is selected. `range` means a range of positions is selected.
   *
   * @returns A string representing the type of selection that is currently active.
   */
  get selectionType(): 'none' | 'caret' | 'range' {
    if (this.noSelection) return 'none';
    else if (this.anchorIndex === this.focusIndex) return 'caret';
    else return 'range';
  }

  /**
   * Returns the current line number of the cursor.
   *
   * @returns The current line number of the cursor.
   */
  get currentLineNumber(): number {
    return this.text.slice(0, this.focusIndex).split('\n').length;
  }

  /**
   * Returns the text before the selection.
   *
   * @returns The text before the selection.
   */
  get preceedingText(): string {
    return this.text.slice(0, Math.min(this.anchorIndex, this.focusIndex));
  }

  /**
   * Returns the text that is currently selected.
   *
   * @returns The text that is currently selected.
   */
  get selectedText(): string {
    return this.text.slice(
      Math.min(this.anchorIndex, this.focusIndex),
      Math.max(this.anchorIndex, this.focusIndex)
    );
  }

  /**
   * Returns the text after the selection.
   *
   * @returns The text after the selection.
   */
  get followingText(): string {
    return this.text.slice(Math.max(this.anchorIndex, this.focusIndex));
  }

  /**
   * Returns the character immediately before the selection.
   *
   * @returns The character immediately before the selection.
   */
  get characterBefore(): string {
    return this.text[this.earliestIndex - 1];
  }

  /**
   * Returns the character immediately after the selection.
   *
   * @returns The character immediately after the selection.
   */
  get characterAfter(): string {
    return this.text[this.latestIndex + 1];
  }

  /**
   * Returns the index of the earliest character in the selection.
   *
   * @returns The index of the earliest character in the selection.
   */
  get earliestIndex(): number {
    return Math.min(this.anchorIndex, this.focusIndex);
  }

  /**
   * Returns the index of the latest character in the selection.
   *
   * @returns The index of the latest character in the selection.
   */
  get latestIndex(): number {
    return Math.max(this.anchorIndex, this.focusIndex);
  }

  /**
   * Returns whether the other text document is equal to this one.
   *
   * @param other The other text document.
   * @returns Whether the other text document is equal to this one.
   */
  strictEquals(other: TextDocument): boolean {
    return (
      this.selectionType === other.selectionType &&
      this.dir === other.dir &&
      this.preceedingText === other.preceedingText &&
      this.selectedText === other.selectedText &&
      this.followingText === other.followingText
    );
  }

  /**
   * Returns whether the other text document is equal to this one, ignoring the selection.
   *
   * @param other The other text document.
   * @returns Whether the other text document is equal to this one, ignoring the selection.
   */
  perceptuallyEquals(other: TextDocument): boolean {
    return this.text === other.text;
  }

  /**
   * Move the selection to the earliest index.
   *
   * @returns A new text document with the selection moved to the earliest index.
   */
  collapseToStart(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot collapse a non-existent selection.');
    if (this.selectionType === 'caret') return this;
    return new TextDocument(this.earliestIndex, this.earliestIndex, this.text);
  }

  /**
   * Move the selection to the latest index.
   *
   * @returns A new text document with the selection moved to the latest index.
   */
  collapseToEnd(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot collapse a non-existent selection.');
    if (this.selectionType === 'caret') return this;
    return new TextDocument(this.latestIndex, this.latestIndex, this.text);
  }

  /**
   * Move the selection forward by one character.
   *
   * @returns A new text document with the selection moved forward by one character.
   */
  skipCharacter(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot skip a non-existent selection.');
    if (this.selectionType === 'range') throw new Error('Cannot skip a range selection.');
    return new TextDocument(this.anchorIndex + 1, this.focusIndex + 1, this.text);
  }

  /**
   * Move the selection forward by one word.
   *
   * @returns A new text document with the selection moved forward by one word.
   */
  skipWord(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot skip a non-existent selection.');
    if (this.selectionType === 'range') throw new Error('Cannot skip a range selection.');

    const text = this.text;

    let i = this.anchorIndex;
    while (i < text.length && isWordCharacter(text[i])) i++;
    while (i < text.length && !isWordCharacter(text[i])) i++;

    return new TextDocument(i, i, text);
  }

  /**
   * Expands the selection to cover the entire line or lines of the cursor.
   *
   * @returns A new text document with the selection expanded to cover the entire line or lines of
   *   the cursor.
   */
  expandToCoverLines(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot expand a non-existent selection.');

    const text = this.text;

    let i = Math.min(this.anchorIndex, this.focusIndex);
    while (i > 0 && text[i - 1] !== '\n') i--;

    let j = Math.max(this.anchorIndex, this.focusIndex);
    while (j < text.length && text[j] !== '\n') j++;

    const result = new TextDocument(this.dir === '->' ? i : j, this.dir === '->' ? j : i, text);

    return result;
  }

  /**
   * Expands the selection to cover the entire word or words of the cursor.
   *
   * @returns A new text document with the selection expanded to cover the entire word or words of
   *   the cursor.
   */
  expandToCoverWords(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot expand a non-existent selection.');

    const text = this.text;

    let i = this.anchorIndex;
    while (i > 0 && isWordCharacter(text[i - 1])) i--;
    let j = this.focusIndex;
    while (j < text.length && isWordCharacter(text[j])) j++;

    return new TextDocument(i, j, text);
  }

  /**
   * Deletes the selection and any text that would be deleted by typing.
   *
   * @returns A new text document with the selection deleted.
   */
  deleteSelection(): TextDocument {
    if (this.selectionType === 'none') throw new Error('Cannot delete a non-existent selection.');

    const text = this.text;

    return new TextDocument(
      this.earliestIndex,
      this.earliestIndex,
      text.slice(0, this.earliestIndex) + text.slice(this.latestIndex),
      false
    );
  }

  /**
   * Inserts text at the selection.
   *
   * @param newText The text to insert.
   * @param advanceAnchor Whether to advance the anchor index by the length of the text.
   * @param advanceFocus Whether to advance the focus index by the length of the text.
   * @returns A new text document with the text inserted at the selection.
   */
  insertText(
    newText: string,
    advanceAnchor: boolean = true,
    advanceFocus: boolean = true
  ): TextDocument {
    if (this.selectionType === 'none')
      throw new Error('Cannot insert text into a non-existent selection.');

    const currentText = this.text;

    const selection =
      this.selectionType === 'range' ? (this.deleteSelection() as TextDocument) : this;
    const newAnchorIndex = selection.anchorIndex + (advanceAnchor ? newText.length : 0);
    const newFocusIndex = selection.focusIndex + (advanceFocus ? newText.length : 0);

    return new TextDocument(
      newAnchorIndex,
      newFocusIndex,
      currentText.slice(0, this.earliestIndex) + newText + currentText.slice(this.latestIndex),
      false
    );
  }
}

/**
 * Returns whether the given character is a word character.
 *
 * @param char The character to check.
 * @returns Whether the given character is a word character.
 */
function isWordCharacter(char: string): boolean {
  return /\w/.test(char);
}
