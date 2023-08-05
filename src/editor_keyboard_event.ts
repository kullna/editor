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
 * The `EditorKeyboardEvent` class wraps a `KeyboardEvent` and provides
 * additional functionality for working with keyboard events.
 * @remarks This class is used internally by the editor and is not intended
 * to be used directly.
 * @internal
 */
export class EditorKeyboardEvent {
  constructor(public readonly event: KeyboardEvent) {}

  /**
   * Prevents the default action of the event.
   */
  preventDefault() {
    this.event.preventDefault();
  }

  /**
   * Stops the propagation of the event.
   */
  stopPropagation() {
    this.event.stopPropagation();
  }

  /**
   * True if the default action of the event has been prevented.
   */
  get defaultPrevented(): boolean {
    return this.event.defaultPrevented;
  }

  /**
   * Obtains the key code from a keyboard event.
   */
  get keyCode(): string {
    const key = this.event.key ?? this.event.keyCode ?? this.event.which;
    if (!key) return '';
    return (typeof key === 'string' ? key : String.fromCharCode(key)).toUpperCase();
  }

  /**
   * True if the given event contains a 'shift' key.
   */
  get isShift(): boolean {
    return this.event.shiftKey;
  }

  /**
   * True if the given event contains a 'ctrl' key.
   */
  get isCtrl(): boolean {
    return this.event.metaKey || this.event.ctrlKey;
  }

  /**
   * True if the given event represents a standard 'undo' keyboard sequence.
   */
  get isUndo(): boolean {
    return this.isCtrl && !this.isShift && this.keyCode === 'Z';
  }

  /**
   * True if the given event represents a standard 'redo' keyboard sequence.
   */
  get isRedo(): boolean {
    return this.isCtrl && this.isShift && this.keyCode === 'Z';
  }

  /**
   * True if the given event represents a standard 'copy' keyboard sequence.
   */
  get isCopy(): boolean {
    return this.isCtrl && this.keyCode === 'C';
  }

  /**
   * True if the given event represents a standard 'paste' keyboard sequence.
   */
  get isPaste(): boolean {
    return this.isCtrl && this.keyCode === 'V';
  }

  /**
   * True if the event represents a keyboard sequence that is likely
   * going to mutate the contents of the editor directly in some way and should
   * be recorded in the undo/redo history. If this method ever returns false
   * for a keyboard sequence that does mutate the editor, the undo/redo history
   * will be corrupted.
   */
  get isMutatingInput(): boolean {
    return (
      !this.isUndo &&
      !this.isRedo &&
      !this.isArrow &&
      this.event.key !== 'Meta' &&
      this.event.key !== 'Control' &&
      this.event.key !== 'Alt'
    );
  }

  /**
   * True if the event is fired within a composition session.
   */
  get isComposing(): boolean {
    return this.event.isComposing;
  }

  /**
   * True if the event represents an 'enter' key press.
   */
  get isEnter(): boolean {
    return this.keyCode === 'ENTER';
  }

  /**
   * True if the event represents a 'tab' key press.
   */
  get isTab(): boolean {
    return this.keyCode === 'TAB';
  }

  /**
   * True if the event represents one of the 'arrow' key press.
   */
  get isArrow(): boolean {
    return (this.keyCode ?? '').startsWith('ARROW');
  }
}
