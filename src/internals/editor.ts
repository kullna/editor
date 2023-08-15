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

import {TextDocument, TextEditorViewKeyboardEvent} from './text_editor';
import {type InputProcessor} from './pipeline';
import {Gutter} from './gutter/gutter';
import {InputProcessorArgs} from './pipeline/input_processor';
import {type UndoRedoClient, UndoRedoManager} from './undo_redo_manager';
import {TextEditorView} from './text_editor/text_editor_view';
import {type TextEditorViewEventHandler} from './text_editor/event_handler';
import {KullnaEditor} from '../kullna_editor';
import {type EditorOptions} from './editor_options';

/**
 * The delay in milliseconds before the highlight function is called. Additional highlight requests
 * made within this time period will be ignored.
 */
const HIGHLIGHT_DEBOUNCE_MS = 30;

/**
 * The delay in milliseconds before undo/redo history is updated. Additional changes made within
 * this time period will be ignored for the purposes of scheduling an undo/redo history update.
 */
const HISTORY_DEBOUNCE_MS = 300;

/**
 * ## A small but feature-rich code editor for the web.
 *
 * Create a new editor instance using the {@link createEditor} function.
 */
export class Editor
  implements KullnaEditor, TextEditorViewEventHandler, UndoRedoClient<TextDocument>
{
  /** The gutter element (if one exists). */
  private readonly gutter?: Gutter;

  /**
   * The selection manager is responsible for keeping track of the current selection in the editor,
   * and assisting with updating the selection if it needs to be adjusted programmatically.
   */
  private readonly view: TextEditorView;

  /**
   * The undo/redo manager is responsible for keeping track of the editor's undo/redo history and
   * supporting state comparisons.
   */
  private readonly undoRedoManager: UndoRedoManager<TextDocument>;

  /** The options that were passed to the editor constructor. */
  private readonly options: EditorOptions;

  /**
   * Constructs a new editor instance.
   *
   * @param parent The parent element to attach the editor to.
   * @param opts The editor options.
   * @returns A new editor instance.
   */
  constructor(parent: HTMLElement, opts: Partial<EditorOptions>) {
    const options: EditorOptions = {
      window,
      dir: 'ltr',
      language: 'text',
      spellcheck: false,
      highlightDebounceMs: HIGHLIGHT_DEBOUNCE_MS,
      historyDebounceMs: HISTORY_DEBOUNCE_MS,

      ...opts
    };
    this.options = options;

    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';
    parent.dir = options.dir;

    if (options.gutter) {
      // Default gutter options if not specified:
      if (options.gutter.dir === undefined) {
        options.gutter.dir = options.dir;
      }

      // Construct the gutter element
      const gutter = new Gutter(options.gutter);
      this.gutter = gutter;
      parent.appendChild(gutter.element);
      if (gutter.highlightElement) {
        parent.appendChild(gutter.highlightElement);
      }
      gutter.dir = options.dir;
    }

    this.undoRedoManager = new UndoRedoManager(this);
    this.view = new TextEditorView(options.window, parent, this);
    this.view.spellchecking = options.spellcheck;
    this.view.dir = options.dir;
    this.view.onLineMetricsChanged = metrics => {
      if (this.gutter) {
        this.gutter.setNumberOfLines(metrics.length);
      }
    };
    this.view.language = options.language;
    if (options.highlight) this.view.highlightElement = options.highlight;
  }

  // ---------------- Editor ----------------

  /** @inheritDoc */
  get spellcheck(): boolean {
    return this.view.spellchecking;
  }
  set spellcheck(spellcheck: boolean) {
    this.view.spellchecking = spellcheck;
  }

  /** @inheritDoc */
  get wrapsText(): boolean {
    return this.view.wrapsText;
  }
  set wrapsText(wrapsText: boolean) {
    this.view.wrapsText = wrapsText;
  }

  /** @inheritDoc */
  get language(): string {
    return this.view.language;
  }
  set language(language: string) {
    this.view.language = language;
  }

  /** @inheritDoc */
  get dir(): 'ltr' | 'rtl' {
    return this.view.dir;
  }
  set dir(dir: 'ltr' | 'rtl') {
    this.view.dir = dir;
    if (this.gutter) {
      this.gutter.dir = dir;
    }
  }

  /** @inheritDoc */
  get highlightedLine(): number {
    return this.gutter ? this.gutter.highlightedLine : -1;
  }
  set highlightedLine(line: number) {
    if (this.gutter) {
      this.gutter.highlightedLine = line;
    }
  }

  /** @inheritDoc */
  invalidateGutterLine(line: number): void {
    if (this.gutter) {
      this.gutter.updateLineNumber(line);
    }
  }

  /**
   * Gets or sets the current text content of the editor.
   *
   * @returns The current text content of the editor.
   */
  get code(): string {
    return this.view.document.text;
  }

  set code(code: string) {
    this.view.document = new TextDocument(0, 0, code, false); //.selectAll().collapseToEnd();
    this.notifyPotentiallyChanged(true);
  }

  /** @inheritDoc */
  get document(): TextDocument {
    return this.view.document;
  }
  set document(document: TextDocument) {
    this.view.document = document;
    this.notifyPotentiallyChanged(true);
  }

  /** @inheritDoc */
  onUpdate(callback: (code: string) => void): void {
    this.options.onUpdate = callback;
  }

  /** @inheritDoc */
  onSelectionFocusChanged(callback: (document: TextDocument) => void): void {
    this.options.onSelectionFocusChanged = callback;
  }

  /** @inheritDoc */
  destroy(): void {
    this.view.destroy();
  }

  // ---------------- EditorStateSerializable ----------------

  /** @inheritDoc */
  currentUndoRedoState(): TextDocument {
    return this.view.document;
  }

  /** @inheritDoc */
  // skipcq: JS-0105: Class methods should utilize this
  undoRedoStatesAreEquivalent(a: TextDocument, b: TextDocument): boolean {
    return a.perceptuallyEquals(b);
  }

  /** @inheritDoc */
  restoreUndoRedoState(document: TextDocument) {
    this.view.document = document;
  }

  // ---------------- EditorInputEventHandler ----------------

  /** @inheritDoc */
  selectionChanged(): void {
    if (this.options.onSelectionFocusChanged) {
      this.options.onSelectionFocusChanged(this.view.document);
    }
  }

  /** @inheritDoc */
  contentChanged(): void {
    this.notifyPotentiallyChanged();
  }

  /** @inheritDoc */
  scroll(element: HTMLElement) {
    if (!this.gutter) return;
    // this.gutter.element.style.top = `-${element.scrollTop}px`;
    this.gutter.setScrollTop(element.scrollTop);
  }

  /** @inheritDoc */
  cut(event: ClipboardEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalEvent = (event as any).originalEvent ?? event;
    originalEvent.clipboardData.setData('text/plain', this.view.document.selectedText);
    this.view.document = this.view.document.deleteSelection();
  }

  /** @inheritDoc */
  paste(event: ClipboardEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalEvent = (event as any).originalEvent ?? event;
    const text = originalEvent.clipboardData.getData('text/plain').replace(/\r\n/g, '\n');
    this.view.document = this.view.document.insertText(text, true, true);
  }

  /** @inheritDoc */
  keydown(event: TextEditorViewKeyboardEvent): boolean {
    if (this.options.keydownPipeline) {
      return this.processPipeline(this.options.keydownPipeline, {handled: false, event});
    }
    return false;
  }

  /** @inheritDoc */
  keyup(event: TextEditorViewKeyboardEvent): boolean {
    if (this.options.keyupPipeline) {
      return this.processPipeline(this.options.keyupPipeline, {handled: false, event});
    }
    return false;
  }

  /** @inheritDoc */
  undo(): void {
    this.undoRedoManager.undo();
  }

  /** @inheritDoc */
  redo(): void {
    this.undoRedoManager.redo();
  }

  // ---------------- Private Methods ----------------

  private processPipeline(pipeline: InputProcessor[], args: InputProcessorArgs): boolean {
    let handled = false;
    const originalDocument = this.view.document;
    let document = originalDocument;
    for (const processor of pipeline) {
      const result = processor(document, args);
      if (result) {
        document = result;
      }
      if (args.handled) {
        handled = true;
        break;
      }
    }
    if (!document.strictEquals(originalDocument)) {
      this.view.document = document;
    }
    return handled;
  }

  /**
   * Should be called whenever the editor's content changes. This method handles:
   *
   * - Highlighting
   * - Updating the line count
   * - Updating the undo/redo history
   * - Calling the onUpdate callback These are all things that happen "onChange".
   *
   * @param programmatic Whether the change was made programmatically.
   */
  private notifyPotentiallyChanged(programmatic: boolean = false) {
    if (this.undoRedoManager.dirty()) {
      if (programmatic) {
        this.undoRedoManager.reset();
      } else {
        this.debouncedRecordHistory();
      }
    }
    if (!programmatic) {
      if (this.options.onUpdate) {
        this.options.onUpdate(this.code);
      }
    }
  }

  private readonly debouncedRecordHistory = debounce(() => {
    this.undoRedoManager.push();
  }, HISTORY_DEBOUNCE_MS);
}

/**
 * Creates a block which debounces calls to the given callback.
 *
 * @param cb The callback to debounce.
 * @param wait The delay in milliseconds before the callback is invoked.
 * @returns A debounced version of the given callback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce(cb: any, wait: number) {
  let timeout = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => cb(...args), wait);
  };
}
