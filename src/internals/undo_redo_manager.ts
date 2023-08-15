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

/** The maximum number of history records to keep. */
const MAX_HISTORY = 300;

/** The error message to show when the target is not set. */
const NO_TARGET_ERROR = 'No target. Please set the target before calling this method.';

/**
 * The `UndoRedoClient` interface specifies the methods clients must implement to be able to use the
 * undo/redo feature.
 */
export interface UndoRedoClient<T> {
  /**
   * When the undo/redo manager needs to push a new record to the history, or when it needs to check
   * if a change has been made, it calls this method to get the current state.
   *
   * @returns The current state of the editor.
   */
  currentUndoRedoState(): T;

  /**
   * When two editor states are compared, the `EditorStateSerializable` interface method is called
   * to determine if the states are equal. Implementations should return true if any differences in
   * the states would not affect user perception of the two states.
   *
   * @param a The first state.
   * @param b The second state.
   * @returns True if the states are equal.
   */
  undoRedoStatesAreEquivalent(a: T, b: T): boolean;

  /**
   * When the state manager needs to restore a state from the history, like when the user undoes or
   * redoes a change, it calls the `EditorStateSerializable` interface method to restore the state.
   *
   * @param state The state to restore.
   */
  restoreUndoRedoState(state: T): void;
}

/** The `UndoRedoManager` class manages the undo/redo history. */
export class UndoRedoManager<T> {
  /** The index of the current state in the history, or -1. */
  private stackIndex = -1;

  /** The undo/redo stack. */
  private stack: T[] = [];

  /**
   * Constructs a new `EditorStateManager` instance.
   *
   * @param target The target editor whose state is managed by this manager.
   */
  constructor(private readonly target?: UndoRedoClient<T>) {}

  /**
   * Determines if the current state of the editor is different from the last recorded state in the
   * undo/redo history.
   *
   * @returns True if the editor has changes that aren't saved in history.
   */
  dirty(): boolean {
    if (!this.target) throw new Error(NO_TARGET_ERROR);
    if (this.stackIndex === -1) return true;

    const state = this.target.currentUndoRedoState();
    if (this.stack.length === 0 || this.stackIndex === -1) return true;
    return !this.target.undoRedoStatesAreEquivalent(state, this.stack[this.stackIndex]);
  }

  /** Records the current state of the editor in the undo/redo history. */
  push() {
    if (!this.target) throw new Error(NO_TARGET_ERROR);

    const record = this.target.currentUndoRedoState();

    if (this.stackIndex !== -1) {
      const lastRecord = this.stack[this.stackIndex];
      if (lastRecord) {
        if (this.target.undoRedoStatesAreEquivalent(lastRecord, record)) {
          this.stack[this.stackIndex] = record;
          return;
        }
      }
    }

    this.stackIndex++;
    this.stack[this.stackIndex] = record;
    this.stack.splice(this.stackIndex + 1);

    if (this.stackIndex > MAX_HISTORY) {
      this.stackIndex = MAX_HISTORY;
      this.stack.splice(0, 1);
    }

    return;
  }

  /** Undoes the last change. */
  undo() {
    if (!this.target) throw new Error(NO_TARGET_ERROR);
    if (this.stackIndex < 0) return;

    this.stackIndex--;
    const record = this.stack[this.stackIndex];
    if (record) {
      this.target.restoreUndoRedoState(record);
    }
  }

  /** Redoes the last change. */
  redo() {
    if (!this.target) throw new Error(NO_TARGET_ERROR);
    if (this.stackIndex >= this.stack.length - 1) return;

    this.stackIndex++;
    const record = this.stack[this.stackIndex];
    if (record) {
      this.target.restoreUndoRedoState(record);
    }
  }

  /** Resets the undo/redo history. */
  reset() {
    this.stackIndex = -1;
    this.stack = [];
    this.push();
  }
}
