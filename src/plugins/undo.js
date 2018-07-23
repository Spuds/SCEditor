(function ($) {
	'use strict';

	$.sceditor.plugins.undo = function () {
		var base = this,
			editor,
			charChangedCount = 0,
			previousValue,
			undoLimit  = 50,
			cursorPosition = -1,
			undoStates = [],
			ignoreNextValueChanged = false;

		/**
		 * Sets the editor to the specified state.
		 *
		 * @param  {Object} state
		 * @private
		 */
		var applyState = function (state) {
			ignoreNextValueChanged = true;

			previousValue = state.value;

			editor.sourceMode(state.sourceMode);
			editor.val(state.value, false);
			editor.focus();

			if (state.sourceMode) {
				editor.sourceEditorCaret(state.caret);
			} else {
				editor.getRangeHelper().restoreRange();
			}

			ignoreNextValueChanged = false;
		};

		/**
		 * Calculates the number of characters that have changed
		 * between two strings.
		 *
		 * @param {String} strA
		 * @param {String} strB
		 * @return {String}
		 * @private
		 */
		var simpleDiff = function (strA, strB) {
			var start, end, aLenDiff, bLenDiff,
				aLength = strA.length,
				bLength = strB.length,
				length  = Math.max(aLength, bLength);

			// Calculate the start
			for (start = 0; start < length; start++) {
				if (strA.charAt(start) !== strB.charAt(start)) {
					break;
				}
			}

			// Calculate the end
			aLenDiff = aLength < bLength ? bLength - aLength : 0;
			bLenDiff = bLength < aLength ? aLength - bLength : 0;

			for (end = length - 1; end >= 0; end--) {
				if (strA.charAt(end - aLenDiff) !==
					strB.charAt(end - bLenDiff)) {
					break;
				}
			}

			return (end - start) + 1;
		};

		/**
		 * Add / remove current state from the stack
		 *
		 * @param {Object} state
		 * @param {int} position
		 */
		var addState = function (state, position) {
			while (position < undoStates.length - 1) {
				undoStates.pop();
			}

			undoStates.push(state);
			cursorPosition = position + 1;
		};

		base.init = function () {
			// The this variable will be set to the instance of the editor
			// calling it, hence why the plugins "this" is saved to the base
			// variable.
			editor = this;

			undoLimit = editor.undoLimit || undoLimit;

			// addShortcut is the easiest way to add handlers to specific
			// shortcuts
			editor.addShortcut('ctrl+z', base.undo);
			editor.addShortcut('ctrl+shift+z', base.redo);
			editor.addShortcut('ctrl+y', base.redo);

			// Add the command so our editor buttons show up
			if (!editor.commands.undo) {
				editor.commands.undo = {
					txtExec: base.undo,
					exec: base.undo,
					tooltip: 'Undo'
				};
				editor.commands.redo = {
					txtExec: base.redo,
					exec: base.redo,
					tooltip: 'Redo'
				};
			}
		};

		base.undo = function () {
			var rawEditorValue = editor.val(null, false);

			if (cursorPosition === -1) {
				return false;
			}

			if (cursorPosition === undoStates.length - 1) {
				addState({
					'caret': editor.sourceEditorCaret(),
					'sourceMode': editor.sourceMode(),
					'value': rawEditorValue
				}, cursorPosition);
			}

			cursorPosition = Math.max(0, cursorPosition - 1);
			applyState(undoStates[cursorPosition]);

			return false;
		};

		base.redo = function () {
			if (cursorPosition === undoStates.length - 1) {
				return false;
			}

			cursorPosition = cursorPosition + 1;
			applyState(undoStates[cursorPosition]);

			return false;
		};

		base.signalReady = function () {
			var rawValue = editor.val(null, false),
				caret;

			// Save a call, and a page jump, when the editor is empty
			if (rawValue === '') {
				caret = {end: 0, start: 0};
			} else {
				caret = this.sourceEditorCaret();
			}

			// Store the initial value as the last value
			previousValue = rawValue;

			addState({
				'caret': caret,
				'sourceMode': this.sourceMode(),
				'value': rawValue
			}, cursorPosition);
		};

		/**
		 * Handle the valueChanged signal.
		 *
		 * e.rawValue will either be the raw HTML from the WYSIWYG editor with
		 * the rangeHelper range markers inserted, or it will be the raw value
		 * of the source editor (BBCode or HTML depending on plugins).
		 * @return {void}
		 */
		base.signalValuechangedEvent = function (e) {
			var rawValue = e.rawValue;

			if (undoLimit > 0 && undoStates.length > undoLimit) {
				undoStates.shift();
			}

			// If the editor hasn't fully loaded yet,
			// then the previous value won't be set.
			if (ignoreNextValueChanged ||
				typeof (previousValue) === 'undefined' ||
				previousValue === rawValue) {
				return;
			}

			// Value has changed so remove all redo states
			charChangedCount += simpleDiff(previousValue, rawValue);

			if (charChangedCount < 20) {
				return;
				// ??
			} else if (charChangedCount < 50 && !/\s$/g.test(e.rawValue)) {
				return;
			}

			addState({
				'caret': editor.sourceEditorCaret(),
				'sourceMode': editor.sourceMode(),
				'value': rawValue
			}, cursorPosition);

			charChangedCount = 0;
			previousValue = rawValue;
		};
	};
}(jQuery));
