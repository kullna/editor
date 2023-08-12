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

/** @packageDocumentation # Input Processors (Dev Version) */
export {type InputProcessor, type InputProcessorArgs} from './input_processor';
export {type NewlineProcessorOptions, newlineProcessor} from './newline_processor';
export {type TabProcessorOptions, tabProcessor} from './tab_processor';
export {type bracketProcessor} from './bracket_processor';

export {DefaultProcessors} from './index';
