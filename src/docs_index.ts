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
 * @packageDocumentation # @kullna/editor Documentation (Dev Version)
 *
 * Welcome to the documentation for the Kullna Editor!
 *
 * Please see: [Test Page](/test.html)
 */
export {Options} from './options';
export {KullnaEditor} from './kullna_editor';
export {EditorOptions} from './internals/editor_options';
export {Editor} from './internals/editor';
export {UndoRedoManager} from './internals/undo_redo_manager';
export * as Text from './internals/text_editor/docs_index';
export * as Gutters from './internals/gutter/docs_index';
export * as Processors from './internals/pipeline/docs_index';
