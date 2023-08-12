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
 * # Throttled Action
 *
 * Will execute an action immediately, and then not execute it again until a certain amount of time
 * has passed - and only if the action has been triggered again. Useful for throttling events such
 * as screen refreshes - where instant feedback is important, but you don't want to refresh the
 * screen too often (note that this isn't a crutch for bad code - if you're refreshing the screen
 * too often (when content hasn't changed) you should probably fix that.) But in the face of a lot
 * of events, this can be useful to minimize wasted screen refreshes.
 */
export class ThrottledAction {
  private timeout?: number;
  private triggered: boolean = false;

  constructor(
    private readonly action: () => void,
    private readonly delay: number
  ) {}

  trigger() {
    if (this.triggered) return;
    if (this.timeout) {
      this.triggered = true;
      return;
    }
    this.executeAction();
    this.timeout = window.setTimeout(() => {
      this.executeAction();
    }, this.delay);
  }

  private executeAction() {
    this.triggered = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.action();
  }
}
