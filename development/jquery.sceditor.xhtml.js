/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * SCEditor
	 * http://www.sceditor.com/
	 *
	 * Copyright (C) 2014, Sam Clarke (samclarke.com)
	 *
	 * SCEditor is licensed under the MIT license:
	 *	http://www.opensource.org/licenses/mit-license.php
	 *
	 * @fileoverview SCEditor - A lightweight WYSIWYG BBCode and HTML editor
	 * @author Sam Clarke
	 * @requires jQuery
	 */
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $             = __webpack_require__(1);
		var SCEditor      = __webpack_require__(2);
		var PluginManager = __webpack_require__(3);
		var browser       = __webpack_require__(7);
		var escape        = __webpack_require__(6);


		// For backwards compatibility
		$.sceditor = SCEditor;

		SCEditor.commands       = __webpack_require__(9);
		SCEditor.defaultOptions = __webpack_require__(10);
		SCEditor.RangeHelper    = __webpack_require__(4);
		SCEditor.dom            = __webpack_require__(5);

		SCEditor.ie                 = browser.ie;
		SCEditor.ios                = browser.ios;
		SCEditor.isWysiwygSupported = browser.isWysiwygSupported;

		SCEditor.regexEscape     = escape.regex;
		SCEditor.escapeEntities  = escape.entities;
		SCEditor.escapeUriScheme = escape.uriScheme;

		SCEditor.PluginManager = PluginManager;
		SCEditor.plugins       = PluginManager.plugins;


		/**
		 * Creates an instance of sceditor on all textareas
		 * matched by the jQuery selector.
		 *
		 * If options is set to "state" it will return bool value
		 * indicating if the editor has been initialised on the
		 * matched textarea(s). If there is only one textarea
		 * it will return the bool value for that textarea.
		 * If more than one textarea is matched it will
		 * return an array of bool values for each textarea.
		 *
		 * If options is set to "instance" it will return the
		 * current editor instance for the textarea(s). Like the
		 * state option, if only one textarea is matched this will
		 * return just the instance for that textarea. If more than
		 * one textarea is matched it will return an array of
		 * instances each textarea.
		 *
		 * @param  {Object|String} options Should either be an Object of options or
		 *                                 the strings "state" or "instance"
		 * @return {this|Array|jQuery.sceditor|Bool}
		 */
		$.fn.sceditor = function (options) {
			var	$this, instance,
				ret = [];

			options = options || {};

			if (!options.runWithoutWysiwygSupport && !browser.isWysiwygSupported) {
				return;
			}

			this.each(function () {
				$this = this.jquery ? this : $(this);
				instance = $this.data('sceditor');

				// Don't allow the editor to be initialised
				// on it's own source editor
				if ($this.parents('.sceditor-container').length > 0) {
					return;
				}

				// Add state of instance to ret if that is what options is set to
				if (options === 'state') {
					ret.push(!!instance);
				} else if (options === 'instance') {
					ret.push(instance);
				} else if (!instance) {
					/*eslint no-new: off*/
					(new SCEditor(this, options));
				}
			});

			// If nothing in the ret array then must be init so return this
			if (!ret.length) {
				return this;
			}

			return ret.length === 1 ? ret[0] : $(ret);
		};
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = jQuery;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $             = __webpack_require__(1);
		var PluginManager = __webpack_require__(3);
		var RangeHelper   = __webpack_require__(4);
		var dom           = __webpack_require__(5);
		var escape        = __webpack_require__(6);
		var browser       = __webpack_require__(7);
		var _tmpl         = __webpack_require__(8);

		var globalWin  = window;
		var globalDoc  = document;
		var $globalWin = $(globalWin);
		var $globalDoc = $(globalDoc);

		var IE_VER = browser.ie;

		// In IE < 11 a BR at the end of a block level element
		// causes a line break. In all other browsers it's collapsed.
		var IE_BR_FIX = IE_VER && IE_VER < 11;

		var IMAGE_MIME_REGEX = /^image\/(p?jpe?g|gif|png|bmp)$/i;

		/**
		 * Wrap inlines that are in the root in paragraphs.
		 *
		 * @param {HTMLBodyElement} body
		 * @param {Document} doc
		 * @private
		 */
		function wrapInlines(body, doc) {
			var wrapper;

			dom.traverse(body, function (node) {
				if (dom.isInline(node, true)) {
					if (!wrapper) {
						wrapper = doc[0].createElement('p');
						node.insertBefore(wrapper);
					}

					if (node.nodeType !== 3 || node.nodeValue !== '') {
						node.appendChild(wrapper);
					}
				} else {
					wrapper = null;
				}
			}, false, true);
		};

		/**
		 * SCEditor - A lightweight WYSIWYG editor
		 *
		 * @param {Element} el The textarea to be converted
		 * @return {Object} options
		 * @class sceditor
		 * @name jQuery.sceditor
		 */
		var SCEditor = function (el, options) {
			/**
			 * Alias of this
			 *
			 * @private
			 */
			var base = this;

			/**
			 * The textarea element being replaced
			 *
			 * @private
			 */
			var original  = el.get ? el.get(0) : el;
			var $original = $(original);

			/**
			 * The div which contains the editor and toolbar
			 *
			 * @private
			 */
			var $editorContainer;

			/**
			 * The editors toolbar
			 *
			 * @private
			 */
			var $toolbar;

			/**
			 * The editors iframe which should be in design mode
			 *
			 * @private
			 */
			var $wysiwygEditor;
			var wysiwygEditor;

			/**
			 * The WYSIWYG editors body element
			 *
			 * @private
			 */
			var $wysiwygBody;

			/**
			 * The WYSIWYG editors document
			 *
			 * @private
			 */
			var $wysiwygDoc;

			/**
			 * The editors textarea for viewing source
			 *
			 * @private
			 */
			var $sourceEditor;
			var sourceEditor;

			/**
			 * The current dropdown
			 *
			 * @private
			 */
			var $dropdown;

			/**
			 * Store the last cursor position. Needed for IE because it forgets
			 *
			 * @private
			 */
			var lastRange;

			/**
			 * If the user is currently composing text via IME
			 * @type {boolean}
			 */
			var isComposing;

			/**
			 * Timer for valueChanged key handler
			 * @type {number}
			 */
			var valueChangedKeyUpTimer;

			/**
			 * The editors locale
			 *
			 * @private
			 */
			var locale;

			/**
			 * Stores a cache of preloaded images
			 *
			 * @private
			 * @type {Array}
			 */
			var preLoadCache = [];

			/**
			 * The editors rangeHelper instance
			 *
			 * @type {jQuery.sceditor.rangeHelper}
			 * @private
			 */
			var rangeHelper;

			/**
			 * An array of button state handlers
			 *
			 * @type {Array}
			 * @private
			 */
			var btnStateHandlers = [];

			/**
			 * Plugin manager instance
			 *
			 * @type {jQuery.sceditor.PluginManager}
			 * @private
			 */
			var pluginManager;

			/**
			 * The current node containing the selection/caret
			 *
			 * @type {Node}
			 * @private
			 */
			var currentNode;

			/**
			 * The first block level parent of the current node
			 *
			 * @type {node}
			 * @private
			 */
			var currentBlockNode;

			/**
			 * The current node selection/caret
			 *
			 * @type {Object}
			 * @private
			 */
			var currentSelection;

			/**
			 * Used to make sure only 1 selection changed
			 * check is called every 100ms.
			 *
			 * Helps improve performance as it is checked a lot.
			 *
			 * @type {Boolean}
			 * @private
			 */
			var isSelectionCheckPending;

			/**
			 * If content is required (equivalent to the HTML5 required attribute)
			 *
			 * @type {Boolean}
			 * @private
			 */
			var isRequired;

			/**
			 * The inline CSS style element. Will be undefined
			 * until css() is called for the first time.
			 *
			 * @type {HTMLElement}
			 * @private
			 */
			var inlineCss;

			/**
			 * Object containing a list of shortcut handlers
			 *
			 * @type {Object}
			 * @private
			 */
			var shortcutHandlers = {};

			/**
			 * An array of all the current emoticons.
			 *
			 * Only used or populated when emoticonsCompat is enabled.
			 *
			 * @type {Array}
			 * @private
			 */
			var currentEmoticons = [];

			/**
			 * The min and max heights that autoExpand should stay within
			 *
			 * @type {Object}
			 * @private
			 */
			var autoExpandBounds;

			/**
			 * Timeout for the autoExpand function to throttle calls
			 *
			 * @private
			 */
			var autoExpandThrottle;

			/**
			 * Cache of the current toolbar buttons
			 *
			 * @type {Object}
			 * @private
			 */
			var toolbarButtons = {};

			/**
			 * Last scroll position before maximizing so
			 * it can be restored when finished.
			 *
			 * @type {number}
			 * @private
			 */
			var maximizeScrollPosiotion;

			/**
			 * Stores the contents while a paste is taking place.
			 *
			 * Needed to support browsers that lack clipboard API support.
			 *
			 * @type {?DocumentFragment}
			 * @private
			 */
			var pasteContentFragment;

			/**
			 * Private functions
			 * @private
			 */
			var	init,
				replaceEmoticons,
				handleCommand,
				saveRange,
				initEditor,
				initPlugins,
				initLocale,
				initToolBar,
				initOptions,
				initEvents,
				initResize,
				initEmoticons,
				handlePasteEvt,
				handlePasteData,
				handleKeyDown,
				handleBackSpace,
				handleKeyPress,
				handleFormReset,
				handleMouseDown,
				handleComposition,
				handleEvent,
				handleDocumentClick,
				handleWindowResize,
				updateToolBar,
				updateActiveButtons,
				sourceEditorSelectedText,
				appendNewLine,
				checkSelectionChanged,
				checkNodeChanged,
				autofocus,
				emoticonsKeyPress,
				emoticonsCheckWhitespace,
				currentStyledBlockNode,
				triggerValueChanged,
				valueChangedBlur,
				valueChangedKeyUp,
				autoUpdate,
				autoExpand;

			/**
			 * All the commands supported by the editor
			 * @name commands
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.commands = $.extend(
				true,
				{},
				(options.commands || SCEditor.commands)
			);

			/**
			 * Options for this editor instance
			 * @name opts
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.opts = options = $.extend({}, SCEditor.defaultOptions, options);


			/**
			 * Creates the editor iframe and textarea
			 * @private
			 */
			init = function () {
				$original.data('sceditor', base);

				// Clone any objects in options
				$.each(options, function (key, val) {
					if ($.isPlainObject(val)) {
						options[key] = $.extend(true, {}, val);
					}
				});

				// Load locale
				if (options.locale && options.locale !== 'en') {
					initLocale();
				}

				$editorContainer = $('<div class="sceditor-container" />')
					.insertAfter($original)
					.css('z-index', options.zIndex);

				// Add IE version to the container to allow IE specific CSS
				// fixes without using CSS hacks or conditional comments
				if (IE_VER) {
					$editorContainer.addClass('ie ie' + IE_VER);
				}

				isRequired = !!$original.attr('required');
				$original.prop('required', false);

				// create the editor
				initPlugins();
				initEmoticons();
				initToolBar();
				initEditor(!!options.startInSourceMode);
				initOptions();
				initEvents();

				// force into source mode if is a browser that can't handle
				// full editing
				if (!browser.isWysiwygSupported) {
					base.toggleSourceMode();
				}

				updateActiveButtons();

				var loaded = function () {
					$globalWin.off('load', loaded);

					if (options.autofocus) {
						autofocus();
					}

					autoExpand();
					appendNewLine();

					// Page width might have changed after CSS is loaded so
					// call handleWindowResize to update any % based dimensions
					handleWindowResize();

					pluginManager.call('ready');
				};
				$globalWin.on('load', loaded);
				if (globalDoc.readyState && globalDoc.readyState === 'complete') {
					loaded();
				}
			};

			initPlugins = function () {
				var plugins   = options.plugins;

				plugins       = plugins ? plugins.toString().split(',') : [];
				pluginManager = new PluginManager(base);

				$.each(plugins, function (idx, plugin) {
					pluginManager.register($.trim(plugin));
				});
			};

			/**
			 * Init the locale variable with the specified locale if possible
			 * @private
			 * @return void
			 */
			initLocale = function () {
				var lang;

				locale = SCEditor.locale[options.locale];

				if (!locale) {
					lang   = options.locale.split('-');
					locale = SCEditor.locale[lang[0]];
				}

				// Locale DateTime format overrides any specified in the options
				if (locale && locale.dateFormat) {
					options.dateFormat = locale.dateFormat;
				}
			};

			/**
			 * Creates the editor iframe and textarea
			 * @param {boolean} startInSourceMode Force loading the editor in this
			 *																	mode
			 * @private
			 */
			initEditor = function (startInSourceMode) {
				var doc;

				$sourceEditor  = $('<textarea></textarea>');
				$wysiwygEditor = $(
					'<iframe frameborder="0" allowfullscreen="true"></iframe>'
				);

				/* This needs to be done right after they are created because,
				 * for any reason, the user may not want the value to be tinkered
				 * by any filters.
				 */
				if (startInSourceMode) {
					$editorContainer.addClass('sourceMode');
					$wysiwygEditor.hide();
				} else {
					$editorContainer.addClass('wysiwygMode');
					$sourceEditor.hide();
				}

				if (!options.spellcheck) {
					$sourceEditor.attr('spellcheck', 'false');
				}

				if (globalWin.location.protocol === 'https:') {
					// eslint-disable-next-line no-script-url
					$wysiwygEditor.attr('src', 'javascript:false');
				}

				// Add the editor to the container
				$editorContainer.append($wysiwygEditor).append($sourceEditor);
				wysiwygEditor = $wysiwygEditor[0];
				sourceEditor  = $sourceEditor[0];

				base.dimensions(
					options.width || $original.width(),
					options.height || $original.height()
				);

				doc = wysiwygEditor.contentDocument;
				doc.open();
				doc.write(_tmpl('html', {
					// Add IE version class to the HTML element so can apply
					// conditional styling without CSS hacks
					attrs: IE_VER ? ' class="ie ie' + IE_VER + '"' : '',
					spellcheck: options.spellcheck ? '' : 'spellcheck="false"',
					charset: options.charset,
					style: options.style
				}));
				doc.close();

				$wysiwygDoc  = $(doc);
				$wysiwygBody = $(doc.body);

				base.readOnly(!!options.readOnly);

				// iframe overflow fix for iOS, also fixes an IE issue with the
				// editor not getting focus when clicking inside
				if (browser.ios || browser.edge || IE_VER) {
					$wysiwygBody.height('100%');

					if (!IE_VER) {
						$wysiwygBody.on('touchend', base.focus);
					}
				}

				var tabIndex = $original.attr('tabindex');
				$sourceEditor.attr('tabindex', tabIndex);
				$wysiwygEditor.attr('tabindex', tabIndex);

				rangeHelper = new RangeHelper(wysiwygEditor.contentWindow);

				// load any textarea value into the editor
				base.val($original.hide().val());

				var placeholder = options.placeholder ||
					$original.attr('placeholder');

				if (placeholder) {
					$sourceEditor.placeholder = placeholder;
					$wysiwygBody.attr('placeholder', placeholder);
				}
			};

			/**
			 * Initialises options
			 * @private
			 */
			initOptions = function () {
				// auto-update original textbox on blur if option set to true
				if (options.autoUpdate) {
					$wysiwygBody.on('blur', autoUpdate);
					$sourceEditor.on('blur', autoUpdate);
				}

				if (options.rtl === null) {
					options.rtl = $sourceEditor.css('direction') === 'rtl';
				}

				base.rtl(!!options.rtl);

				if (options.autoExpand) {
					// Need to update when images (or anything else) loads
					$wysiwygBody[0].addEventListener('load', autoExpand, true);
					$wysiwygDoc.on('input keyup', autoExpand);
				}

				if (options.resizeEnabled) {
					initResize();
				}

				$editorContainer.attr('id', options.id);
				base.emoticons(options.emoticonsEnabled);
			};

			/**
			 * Initialises events
			 * @private
			 */
			initEvents = function () {
				var compositionEvents = 'compositionstart compositionend';
				var eventsToForward = 'keydown keyup keypress ' +
					'focus blur contextmenu';
				var checkSelectionEvents = 'onselectionchange' in $wysiwygDoc ?
					'selectionchange' :
					'keyup focus blur contextmenu mouseup touchend click';

				$globalDoc.click(handleDocumentClick);

				$(original.form)
					.on('reset', handleFormReset)
					.submit(base.updateOriginal);

				$globalWin.on('resize orientationChanged', handleWindowResize);

				$wysiwygBody
					.keypress(handleKeyPress)
					.keydown(handleKeyDown)
					.keydown(handleBackSpace)
					.keyup(appendNewLine)
					.blur(valueChangedBlur)
					.keyup(valueChangedKeyUp)
					.on('paste', handlePasteEvt)
					.on(compositionEvents, handleComposition)
					.on(checkSelectionEvents, checkSelectionChanged)
					.on(eventsToForward, handleEvent);

				if (options.emoticonsCompat && globalWin.getSelection) {
					$wysiwygBody.keyup(emoticonsCheckWhitespace);
				}

				$wysiwygBody.on('blur', function () {
					if (!base.val()) {
						$wysiwygBody.addClass('placeholder');
					}
				});

				$wysiwygBody.on('focus', function () {
					$wysiwygBody.removeClass('placeholder');
				});

				$sourceEditor
					.blur(valueChangedBlur)
					.keyup(valueChangedKeyUp)
					.keydown(handleKeyDown)
					.on(compositionEvents, handleComposition)
					.on(eventsToForward, handleEvent);

				$wysiwygDoc
					.mousedown(handleMouseDown)
					.on(checkSelectionEvents, checkSelectionChanged)
					.on('beforedeactivate keyup mouseup', saveRange)
					.keyup(appendNewLine)
					.focus(function () {
						lastRange = null;
					});

				$editorContainer
					.on('selectionchanged', checkNodeChanged)
					.on('selectionchanged', updateActiveButtons)
					.on('selectionchanged valuechanged nodechanged', handleEvent);
			};

			/**
			 * Creates the toolbar and appends it to the container
			 * @private
			 */
			initToolBar = function () {
				var	$group,
					commands = base.commands,
					exclude  = (options.toolbarExclude || '').split(','),
					groups   = options.toolbar.split('|');

				$toolbar = $('<div class="sceditor-toolbar" unselectable="on" />');

				$.each(groups, function (idx, group) {
					$group  = $('<div class="sceditor-group" />');

					$.each(group.split(','), function (idx, commandName) {
						var	$button, shortcut,
							command  = commands[commandName];

						// The commandName must be a valid command and not excluded
						if (!command || $.inArray(commandName, exclude) > -1) {
							return;
						}

						shortcut = command.shortcut;
						$button  = _tmpl('toolbarButton', {
							name: commandName,
							dispName: base._(command.name ||
									command.tooltip || commandName)
						}, true);

						$button
							.data('sceditor-txtmode', !!command.txtExec)
							.data('sceditor-wysiwygmode', !!command.exec)
							.toggleClass('disabled', !command.exec)
							.click(function () {
								var $this = $(this);

								if (!$this.hasClass('disabled')) {
									handleCommand($this, command);
								}

								updateActiveButtons();
								return false;
							});

						if (command.tooltip) {
							$button.attr(
								'title',
								base._(command.tooltip) +
									(shortcut ? ' (' + shortcut + ')' : '')
							);
						}

						if (shortcut) {
							base.addShortcut(shortcut, commandName);
						}

						if (command.state) {
							btnStateHandlers.push({
								name: commandName,
								state: command.state
							});
						// exec string commands can be passed to queryCommandState
						} else if (typeof command.exec === 'string') {
							btnStateHandlers.push({
								name: commandName,
								state: command.exec
							});
						}

						$group.append($button);
						toolbarButtons[commandName] = $button;
					});

					// Exclude empty groups
					if ($group[0].firstChild) {
						$toolbar.append($group);
					}
				});

				// Append the toolbar to the toolbarContainer option if given
				$(options.toolbarContainer || $editorContainer).append($toolbar);
			};

			/**
			 * Creates the resizer.
			 * @private
			 */
			initResize = function () {
				var	minHeight, maxHeight, minWidth, maxWidth,
					mouseMoveFunc, mouseUpFunc,
					$grip       = $('<div class="sceditor-grip" />'),
					// Cover is used to cover the editor iframe so document
					// still gets mouse move events
					$cover      = $('<div class="sceditor-resize-cover" />'),
					moveEvents  = 'touchmove mousemove',
					endEvents   = 'touchcancel touchend mouseup',
					startX      = 0,
					startY      = 0,
					newX        = 0,
					newY        = 0,
					startWidth  = 0,
					startHeight = 0,
					origWidth   = $editorContainer.width(),
					origHeight  = $editorContainer.height(),
					isDragging  = false,
					rtl         = base.rtl();

				minHeight = options.resizeMinHeight || origHeight / 1.5;
				maxHeight = options.resizeMaxHeight || origHeight * 2.5;
				minWidth  = options.resizeMinWidth  || origWidth  / 1.25;
				maxWidth  = options.resizeMaxWidth  || origWidth  * 1.25;

				mouseMoveFunc = function (e) {
					// iOS uses window.event
					if (e.type === 'touchmove') {
						e    = globalWin.event;
						newX = e.changedTouches[0].pageX;
						newY = e.changedTouches[0].pageY;
					} else {
						newX = e.pageX;
						newY = e.pageY;
					}

					var	newHeight = startHeight + (newY - startY),
						newWidth  = rtl ?
							startWidth - (newX - startX) :
							startWidth + (newX - startX);

					if (maxWidth > 0 && newWidth > maxWidth) {
						newWidth = maxWidth;
					}
					if (minWidth > 0 && newWidth < minWidth) {
						newWidth = minWidth;
					}
					if (!options.resizeWidth) {
						newWidth = false;
					}

					if (maxHeight > 0 && newHeight > maxHeight) {
						newHeight = maxHeight;
					}
					if (minHeight > 0 && newHeight < minHeight) {
						newHeight = minHeight;
					}
					if (!options.resizeHeight) {
						newHeight = false;
					}

					if (newWidth || newHeight) {
						base.dimensions(newWidth, newHeight);

						// The resize cover will not fill the container
						// in IE6 unless a height is specified.
						if (IE_VER < 7) {
							$editorContainer.height(newHeight);
						}
					}

					e.preventDefault();
				};

				mouseUpFunc = function (e) {
					if (!isDragging) {
						return;
					}

					isDragging = false;

					$cover.hide();
					$editorContainer.removeClass('resizing').height('auto');
					$globalDoc.off(moveEvents, mouseMoveFunc);
					$globalDoc.off(endEvents, mouseUpFunc);

					e.preventDefault();
				};

				$editorContainer.append($grip);
				$editorContainer.append($cover.hide());

				$grip.on('touchstart mousedown', function (e) {
					// iOS uses window.event
					if (e.type === 'touchstart') {
						e      = globalWin.event;
						startX = e.touches[0].pageX;
						startY = e.touches[0].pageY;
					} else {
						startX = e.pageX;
						startY = e.pageY;
					}

					startWidth  = $editorContainer.width();
					startHeight = $editorContainer.height();
					isDragging  = true;

					$editorContainer.addClass('resizing');
					$cover.show();
					$globalDoc.on(moveEvents, mouseMoveFunc);
					$globalDoc.on(endEvents, mouseUpFunc);

					// The resize cover will not fill the container in
					// IE6 unless a height is specified.
					if (IE_VER < 7) {
						$editorContainer.height(startHeight);
					}

					e.preventDefault();
				});
			};

			/**
			 * Prefixes and preloads the emoticon images
			 * @private
			 */
			initEmoticons = function () {
				var	emoticon,
					emoticons = options.emoticons,
					root      = options.emoticonsRoot;

				if (!$.isPlainObject(emoticons) || !options.emoticonsEnabled) {
					return;
				}

				$.each(emoticons, function (idx, val) {
					$.each(val, function (key, url) {
						// Prefix emoticon root to emoticon urls
						if (root) {
							url = {
								url: root + (url.url || url),
								tooltip: url.tooltip || key
							};

							emoticons[idx][key] = url;
						}

						// Preload the emoticon
						emoticon     = globalDoc.createElement('img');
						emoticon.src = url.url || url;
						preLoadCache.push(emoticon);
					});
				});
			};

			/**
			 * Autofocus the editor
			 * @private
			 */
			autofocus = function () {
				var	range, txtPos,
					doc      = $wysiwygDoc[0],
					body     = $wysiwygBody[0],
					node     = body.firstChild,
					focusEnd = !!options.autofocusEnd;

				// Can't focus invisible elements
				if (!$editorContainer.is(':visible')) {
					return;
				}

				if (base.sourceMode()) {
					txtPos = focusEnd ? sourceEditor.value.length : 0;

					if (sourceEditor.setSelectionRange) {
						sourceEditor.setSelectionRange(txtPos, txtPos);
					} else {
						range = sourceEditor.createTextRange();
						range.moveEnd('character', txtPos);
						range.collapse(false);
						range.select();
					}

					return;
				}

				dom.removeWhiteSpace(body);

				if (focusEnd) {
					if (!(node = body.lastChild)) {
						node = doc.createElement('p');
						$wysiwygBody.append(node);
					}

					while (node.lastChild) {
						node = node.lastChild;

						// IE < 11 should place the cursor after the <br> as
						// it will show it as a newline. IE >= 11 and all
						// other browsers should place the cursor before.
						if (!IE_BR_FIX && $(node).is('br') &&
							node.previousSibling) {
							node = node.previousSibling;
						}
					}
				}

				if (doc.createRange) {
					range = doc.createRange();

					if (!dom.canHaveChildren(node)) {
						range.setStartBefore(node);

						if (focusEnd) {
							range.setStartAfter(node);
						}
					} else {
						range.selectNodeContents(node);
					}
				} else {
					range = body.createTextRange();
					range.moveToElementText(node.nodeType !== 3 ?
						node : node.parentNode);
				}

				range.collapse(!focusEnd);
				rangeHelper.selectRange(range);
				currentSelection = range;

				if (focusEnd) {
					$wysiwygDoc.scrollTop(body.scrollHeight);
					$wysiwygBody.scrollTop(body.scrollHeight);
				}

				base.focus();
			};

			/**
			 * Gets if the editor is read only
			 *
			 * @since 1.3.5
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name readOnly
			 * @return {Boolean}
			 */
			/**
			 * Sets if the editor is read only
			 *
			 * @param {boolean} readOnly
			 * @since 1.3.5
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name readOnly^2
			 * @return {this}
			 */
			base.readOnly = function (readOnly) {
				if (typeof readOnly !== 'boolean') {
					return $sourceEditor.attr('readonly') === 'readonly';
				}

				$wysiwygBody[0].contentEditable = !readOnly;

				if (!readOnly) {
					$sourceEditor.prop('readonly', false);
				} else {
					$sourceEditor.attr('readonly', 'readonly');
				}

				updateToolBar(readOnly);

				return base;
			};

			/**
			 * Gets if the editor is in RTL mode
			 *
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name rtl
			 * @return {Boolean}
			 */
			/**
			 * Sets if the editor is in RTL mode
			 *
			 * @param {boolean} rtl
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name rtl^2
			 * @return {this}
			 */
			base.rtl = function (rtl) {
				var dir = rtl ? 'rtl' : 'ltr';

				if (typeof rtl !== 'boolean') {
					return $sourceEditor.attr('dir') === 'rtl';
				}

				$wysiwygBody.attr('dir', dir);
				$sourceEditor.attr('dir', dir);

				$editorContainer
					.removeClass('rtl')
					.removeClass('ltr')
					.addClass(dir);

				return base;
			};

			/**
			 * Updates the toolbar to disable/enable the appropriate buttons
			 * @private
			 */
			updateToolBar = function (disable) {
				var mode = base.inSourceMode() ? 'txtmode' : 'wysiwygmode';

				$.each(toolbarButtons, function (idx, $button) {
					if (disable === true || !$button.data('sceditor-' + mode)) {
						$button.addClass('disabled');
					} else {
						$button.removeClass('disabled');
					}
				});
			};

			/**
			 * Gets the width of the editor in pixels
			 *
			 * @since 1.3.5
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name width
			 * @return {int}
			 */
			/**
			 * Sets the width of the editor
			 *
			 * @param {int} width Width in pixels
			 * @since 1.3.5
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name width^2
			 * @return {this}
			 */
			/**
			 * Sets the width of the editor
			 *
			 * The saveWidth specifies if to save the width. The stored width can be
			 * used for things like restoring from maximized state.
			 *
			 * @param {int}     width            Width in pixels
			 * @param {boolean}	[saveWidth=true] If to store the width
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name width^3
			 * @return {this}
			 */
			base.width = function (width, saveWidth) {
				if (!width && width !== 0) {
					return $editorContainer.width();
				}

				base.dimensions(width, null, saveWidth);

				return base;
			};

			/**
			 * Returns an object with the properties width and height
			 * which are the width and height of the editor in px.
			 *
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name dimensions
			 * @return {object}
			 */
			/**
			 * <p>Sets the width and/or height of the editor.</p>
			 *
			 * <p>If width or height is not numeric it is ignored.</p>
			 *
			 * @param {int}	width	Width in px
			 * @param {int}	height	Height in px
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name dimensions^2
			 * @return {this}
			 */
			/**
			 * <p>Sets the width and/or height of the editor.</p>
			 *
			 * <p>If width or height is not numeric it is ignored.</p>
			 *
			 * <p>The save argument specifies if to save the new sizes.
			 * The saved sizes can be used for things like restoring from
			 * maximized state. This should normally be left as true.</p>
			 *
			 * @param {int}		width		Width in px
			 * @param {int}		height		Height in px
			 * @param {boolean}	[save=true]	If to store the new sizes
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name dimensions^3
			 * @return {this}
			 */
			base.dimensions = function (width, height, save) {
				// IE6 & IE7 add 2 pixels to the source mode textarea
				// height which must be ignored.
				// Doesn't seem to be any way to fix it with only CSS
				var ieBorder = IE_VER < 8 || globalDoc.documentMode < 8 ? 2 : 0;
				var undef;

				// set undefined width/height to boolean false
				width  = (!width && width !== 0) ? false : width;
				height = (!height && height !== 0) ? false : height;

				if (width === false && height === false) {
					return { width: base.width(), height: base.height() };
				}

				if ($wysiwygEditor.data('outerWidthOffset') === undef) {
					base.updateStyleCache();
				}

				if (width !== false) {
					if (save !== false) {
						options.width = width;
					}
	// This is the problem
					if (height === false) {
						height = $editorContainer.height();
						save   = false;
					}

					$editorContainer.width(width);
					if (width && width.toString().indexOf('%') > -1) {
						width = $editorContainer.width();
					}

					$wysiwygEditor.width(
						width - $wysiwygEditor.data('outerWidthOffset')
					);

					$sourceEditor.width(
						width - $sourceEditor.data('outerWidthOffset')
					);

					// Fix overflow issue with iOS not
					// breaking words unless a width is set
					if (browser.ios && $wysiwygBody) {
						$wysiwygBody.width(
							width - $wysiwygEditor.data('outerWidthOffset') -
							($wysiwygBody.outerWidth(true) - $wysiwygBody.width())
						);
					}
				}

				if (height !== false) {
					if (save !== false) {
						options.height = height;
					}

					// Convert % based heights to px
					if (height && height.toString().indexOf('%') > -1) {
						height = $editorContainer.height(height).height();
						$editorContainer.height('auto');
					}

					height -= !options.toolbarContainer ?
						$toolbar.outerHeight(true) : 0;

					$wysiwygEditor.height(
						height - $wysiwygEditor.data('outerHeightOffset')
					);

					$sourceEditor.height(
						height - ieBorder - $sourceEditor.data('outerHeightOffset')
					);
				}

				return base;
			};

			/**
			 * Updates the CSS styles cache.
			 *
			 * This shouldn't be needed unless changing the editors theme.
			 *F
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name updateStyleCache
			 * @return {int}
			 */
			base.updateStyleCache = function () {
				// caching these improves FF resize performance
				$wysiwygEditor.data(
					'outerWidthOffset',
					$wysiwygEditor.outerWidth(true) - $wysiwygEditor.width()
				);
				$sourceEditor.data(
					'outerWidthOffset',
					$sourceEditor.outerWidth(true) - $sourceEditor.width()
				);

				$wysiwygEditor.data(
					'outerHeightOffset',
					$wysiwygEditor.outerHeight(true) - $wysiwygEditor.height()
				);
				$sourceEditor.data(
					'outerHeightOffset',
					$sourceEditor.outerHeight(true) - $sourceEditor.height()
				);
			};

			/**
			 * Gets the height of the editor in px
			 *
			 * @since 1.3.5
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name height
			 * @return {int}
			 */
			/**
			 * Sets the height of the editor
			 *
			 * @param {int} height Height in px
			 * @since 1.3.5
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name height^2
			 * @return {this}
			 */
			/**
			 * Sets the height of the editor
			 *
			 * The saveHeight specifies if to save the height.
			 *
			 * The stored height can be used for things like
			 * restoring from maximized state.
			 *
			 * @param {int} height Height in px
			 * @param {boolean} [saveHeight=true] If to store the height
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name height^3
			 * @return {this}
			 */
			base.height = function (height, saveHeight) {
				if (!height && height !== 0) {
					return $editorContainer.height();
				}

				base.dimensions(null, height, saveHeight);

				return base;
			};

			/**
			 * Gets if the editor is maximised or not
			 *
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name maximize
			 * @return {boolean}
			 */
			/**
			 * Sets if the editor is maximised or not
			 *
			 * @param {boolean} maximize If to maximise the editor
			 * @since 1.4.1
			 * @function
			 * @memberOf jQuery.sceditor.prototype
			 * @name maximize^2
			 * @return {this}
			 */
			base.maximize = function (maximize) {
				var maximizeSize = 'sceditor-maximize';

				if (typeof maximize === 'undefined') {
					return $editorContainer.is('.' + maximizeSize);
				}

				maximize = !!maximize;

				if (maximize) {
					maximizeScrollPosiotion = $globalWin.scrollTop();
				}

				$('html, body').toggleClass(maximizeSize, maximize);
				$editorContainer.toggleClass(maximizeSize, maximize);
				base.width(maximize ? '100%' : options.width, false);
				base.height(maximize ? '100%' : options.height, false);

				if (!maximize) {
					$globalWin.scrollTop(maximizeScrollPosiotion);
				}

				autoExpand();

				return base;
			};

			autoExpand = function () {
				if (options.autoExpand && !autoExpandThrottle) {
					setTimeout(base.expandToContent, 200);
				}
			};

			/**
			 * Expands or shrinks the editors height to the height of it's content
			 *
			 * Unless ignoreMaxHeight is set to true it will not expand
			 * higher than the maxHeight option.
			 *
			 * @since 1.3.5
			 * @param {Boolean} [ignoreMaxHeight=false]
			 * @function
			 * @name expandToContent
			 * @memberOf jQuery.sceditor.prototype
			 * @see #resizeToContent
			 */
			base.expandToContent = function (ignoreMaxHeight) {
				if (base.maximize()) {
					return;
				}

				autoExpandThrottle = false;

				if (!autoExpandBounds) {
					var height = options.resizeMinHeight || options.height ||
						$original.height();

					autoExpandBounds = {
						min: height,
						max: options.resizeMaxHeight || (height * 2)
					};
				}

				var range = document.createRange();
				range.selectNodeContents($wysiwygBody[0]);

				var rect = range.getBoundingClientRect();
				var current = $wysiwygDoc[0].documentElement.clientHeight;
				var spaceNeeded = rect.bottom - rect.top;
				var newHeight = base.height() + (spaceNeeded - current);

				if (!ignoreMaxHeight && autoExpandBounds.max !== -1) {
					newHeight = Math.min(newHeight, autoExpandBounds.max);
				}

				base.height(Math.ceil(Math.max(newHeight, autoExpandBounds.min)));
			};

			/**
			 * Destroys the editor, removing all elements and
			 * event handlers.
			 *
			 * Leaves only the original textarea.
			 *
			 * @function
			 * @name destroy
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.destroy = function () {
				// Don't destroy if the editor has already been destroyed
				if (!pluginManager) {
					return;
				}

				pluginManager.destroy();

				rangeHelper   = null;
				lastRange     = null;
				pluginManager = null;

				if ($dropdown) {
					$dropdown.off().remove();
				}

				$globalDoc.off('click', handleDocumentClick);
				$globalWin.off('resize orientationChanged', handleWindowResize);

				$(original.form)
					.off('reset', handleFormReset)
					.off('submit', base.updateOriginal);

				$wysiwygBody.off();
				$wysiwygDoc.off().find('*').remove();

				$sourceEditor.off().remove();
				$toolbar.remove();
				$editorContainer.off().find('*').off().remove();
				$editorContainer.remove();

				$original
					.removeData('sceditor')
					.removeData('sceditorbbcode')
					.show();

				if (isRequired) {
					$original.attr('required', 'required');
				}
			};


			/**
			 * Creates a menu item drop down
			 *
			 * @param  {HTMLElement} menuItem The button to align the dropdown with
			 * @param  {string} name          Used for styling the dropdown, will be
			 *                                a class sceditor-name
			 * @param  {HTMLElement} content  The HTML content of the dropdown
			 * @param  {bool} ieFix           If to add the unselectable attribute
			 *                                to all the contents elements. Stops
			 *                                IE from deselecting the text in the
			 *                                editor
			 * @function
			 * @name createDropDown
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.createDropDown = function (menuItem, name, content, ieFix) {
				// first click for create second click for close
				var	dropDownCss,
					cssClass = 'sceditor-' + name,
					onlyclose = $dropdown && $dropdown.is('.' + cssClass);

				// Will re-focus the editor. This is needed for IE
				// as it has special logic to save/restore the selection
				base.closeDropDown(true);

				if (onlyclose) {
					return;
				}

				// IE needs unselectable attr to stop it from
				// unselecting the text in the editor.
				// SCEditor can cope if IE does unselect the
				// text it's just not nice.
				if (ieFix !== false) {
					$(content)
						.find(':not(input,textarea)')
						.filter(function () {
							return this.nodeType === 1;
						})
						.attr('unselectable', 'on');
				}

				dropDownCss = {
					top: menuItem.offset().top,
					left: menuItem.offset().left,
					marginTop: menuItem.outerHeight()
				};
				$.extend(dropDownCss, options.dropDownCss);

				$dropdown = $('<div class="sceditor-dropdown ' + cssClass + '" />')
					.css(dropDownCss)
					.append(content)
					.appendTo($('body'))
					.on('click focusin', function (e) {
						// stop clicks within the dropdown from being handled
						e.stopPropagation();
					});

				// If try to focus the first input immediately IE will
				// place the cursor at the start of the editor instead
				// of focusing on the input.
				setTimeout(function () {
					if ($dropdown) {
						$dropdown.find('input,textarea').first().focus();
					}
				});
			};

			/**
			 * Handles any document click and closes the dropdown if open
			 * @private
			 */
			handleDocumentClick = function (e) {
				// ignore right clicks
				if (e.which !== 3 && $dropdown) {
					autoUpdate();

					base.closeDropDown();
				}
			};

			/**
			 * Handles the WYSIWYG editors paste event
			 * @private
			 */
			handlePasteEvt = function (e) {
				var isIeOrEdge = IE_VER || browser.edge;
				var editable = $wysiwygBody[0];
				var clipboard = e.originalEvent.clipboardData;
				var loadImage = function (file) {
					var reader = new FileReader();
					reader.onload = function (e) {
						handlePasteData({
							html: '<img src="' + e.target.result + '" />'
						});
					};
					reader.readAsDataURL(file);
				};

				// Modern browsers with clipboard API - everything other than _very_
				// old android web views and UC browseer which doesn't support the
				// paste event at all.
				if (clipboard && !isIeOrEdge) {
					var data = {};
					var types = clipboard.types;
					var items = clipboard.items;

					e.preventDefault();

					for (var i = 0; i < types.length; i++) {
						// Normalise image pasting to paste as a data-uri
						if (window.FileReader && items &&
							IMAGE_MIME_REGEX.test(items[i].type)) {
							return loadImage(clipboard.items[i].getAsFile());
						}

						data[types[i]] = clipboard.getData(types[i]);
					}
					// Call plugins here with file?
					data.text = data['text/plain'];
					data.html = data['text/html'];

					handlePasteData(data);
				// If contentsFragment exists then we are already waiting for a
				// previous paste so let the handler for that handle this one too
				} else if (!pasteContentFragment) {
					// Save the scroll position so can be restored
					// when contents is restored
					var scrollTop = editable.scrollTop;

					rangeHelper.saveRange();

					pasteContentFragment = document.createDocumentFragment();
					while (editable.firstChild) {
						pasteContentFragment.appendChild(editable.firstChild);
					}

					setTimeout(function () {
						var html = editable.innerHTML;

						editable.innerHTML = '';
						editable.appendChild(pasteContentFragment);
						editable.scrollTop = scrollTop;
						pasteContentFragment = false;

						rangeHelper.restoreRange();

						handlePasteData({ html: html });
					}, 0);
				}
			};

			/**
			 * Gets the pasted data, filters it and then inserts it.
			 * @param {Object} data
			 * @private
			 */
			handlePasteData = function (data) {
				var pastearea = $wysiwygDoc[0].createElement('div');

				pluginManager.call('pasteRaw', data);

				if (data.html) {
					pastearea.innerHTML = data.html;

					// fix any invalid nesting
					dom.fixNesting(pastearea);
				} else {
					pastearea.innerHTML = escape.entities(data.text || '');
				}

				var paste = {
					val: pastearea.innerHTML
				};

				if (pluginManager.hasHandler('toSource')) {
					$wysiwygBody.append(pastearea);

					paste.val = pluginManager
						.callOnlyFirst('toSource', paste.val, $(pastearea));

					$(pastearea).remove();
				}

				pluginManager.call('paste', paste);

				if (pluginManager.hasHandler('toWysiwyg')) {
					paste.val = pluginManager
						.callOnlyFirst('toWysiwyg', paste.val, true);
				}

				pluginManager.call('pasteHtml', paste);

				base.wysiwygEditorInsertHtml(paste.val, null, true);
			};

			/**
			 * Closes any currently open drop down
			 *
			 * @param {bool} [focus=false] If to focus the editor
			 *                             after closing the drop down
			 * @function
			 * @name closeDropDown
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.closeDropDown = function (focus) {
				if ($dropdown) {
					$dropdown.off().remove();
					$dropdown = null;
				}

				if (focus === true) {
					base.focus();
				}
			};

			/**
			 * <p>Inserts HTML into WYSIWYG editor.</p>
			 *
			 * <p>If endHtml is specified, any selected text will be placed
			 * between html and endHtml. If there is no selected text html
			 * and endHtml will just be concatenate together.</p>
			 *
			 * @param {string} html
			 * @param {string} [endHtml=null]
			 * @param {boolean} [overrideCodeBlocking=false] If to insert the html
			 *                                               into code tags, by
			 *                                               default code tags only
			 *                                               support text.
			 * @function
			 * @name wysiwygEditorInsertHtml
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.wysiwygEditorInsertHtml = function (
				html, endHtml, overrideCodeBlocking
			) {
				var	$marker, scrollTop, scrollTo,
					editorHeight = $wysiwygEditor.height();

				base.focus();

	// TODO: This code tag should be configurable and
	// should maybe convert the HTML into text instead
				// Don't apply to code elements
				if (!overrideCodeBlocking && ($(currentBlockNode).is('code') ||
					$(currentBlockNode).parents('code').length !== 0)) {
					return;
				}

				// Insert the HTML and save the range so the editor can be scrolled
				// to the end of the selection. Also allows emoticons to be replaced
				// without affecting the cursor position
				rangeHelper.insertHTML(html, endHtml);
				rangeHelper.saveRange();
				replaceEmoticons($wysiwygBody[0]);

				// Scroll the editor after the end of the selection
				$marker   = $wysiwygBody.find('#sceditor-end-marker').show();
				scrollTop = $wysiwygBody.scrollTop() || $wysiwygDoc.scrollTop();
				scrollTo  = (dom.getOffset($marker[0]).top +
					($marker.outerHeight(true) * 1.5)) - editorHeight;
				$marker.hide();

				// Only scroll if marker isn't already visible
				if (scrollTo > scrollTop || scrollTo + editorHeight < scrollTop) {
					$wysiwygBody.scrollTop(scrollTo);
					$wysiwygDoc.scrollTop(scrollTo);
				}

				triggerValueChanged(false);
				rangeHelper.restoreRange();

				// Add a new line after the last block element
				// so can always add text after it
				appendNewLine();
			};

			/**
			 * Like wysiwygEditorInsertHtml except it will convert any HTML
			 * into text before inserting it.
			 *
			 * @param {String} text
			 * @param {String} [endText=null]
			 * @function
			 * @name wysiwygEditorInsertText
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.wysiwygEditorInsertText = function (text, endText) {
				base.wysiwygEditorInsertHtml(
					escape.entities(text), escape.entities(endText)
				);
			};

			/**
			 * <p>Inserts text into the WYSIWYG or source editor depending on which
			 * mode the editor is in.</p>
			 *
			 * <p>If endText is specified any selected text will be placed between
			 * text and endText. If no text is selected text and endText will
			 * just be concatenate together.</p>
			 *
			 * @param {String} text
			 * @param {String} [endText=null]
			 * @since 1.3.5
			 * @function
			 * @name insertText
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.insertText = function (text, endText) {
				if (base.inSourceMode()) {
					base.sourceEditorInsertText(text, endText);
				} else {
					base.wysiwygEditorInsertText(text, endText);
				}

				return base;
			};

			/**
			 * <p>Like wysiwygEditorInsertHtml but inserts text into the
			 * source mode editor instead.</p>
			 *
			 * <p>If endText is specified any selected text will be placed between
			 * text and endText. If no text is selected text and endText will
			 * just be concatenate together.</p>
			 *
			 * <p>The cursor will be placed after the text param. If endText is
			 * specified the cursor will be placed before endText, so passing:<br />
			 *
			 * '[b]', '[/b]'</p>
			 *
			 * <p>Would cause the cursor to be placed:<br />
			 *
			 * [b]Selected text|[/b]</p>
			 *
			 * @param {String} text
			 * @param {String} [endText=null]
			 * @since 1.4.0
			 * @function
			 * @name sourceEditorInsertText
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.sourceEditorInsertText = function (text, endText) {
				var range, scrollTop, currentValue,
					startPos = sourceEditor.selectionStart,
					endPos   = sourceEditor.selectionEnd;

				scrollTop = sourceEditor.scrollTop;
				sourceEditor.focus();

				// All browsers except IE < 9
				if (typeof startPos !== 'undefined') {
					currentValue = sourceEditor.value;

					if (endText) {
						text += currentValue.substring(startPos, endPos) + endText;
					}

					sourceEditor.value = currentValue.substring(0, startPos) +
						text +
						currentValue.substring(endPos, currentValue.length);

					sourceEditor.selectionStart = (startPos + text.length) -
						(endText ? endText.length : 0);
					sourceEditor.selectionEnd = sourceEditor.selectionStart;
				// IE < 9
				} else {
					range = globalDoc.selection.createRange();

					if (endText) {
						text += range.text + endText;
					}

					range.text = text;

					if (endText) {
						range.moveEnd('character', 0 - endText.length);
					}

					range.moveStart('character', range.End - range.Start);
					range.select();
				}

				sourceEditor.scrollTop = scrollTop;
				sourceEditor.focus();

				triggerValueChanged();
			};

			/**
			 * Gets the current instance of the rangeHelper class
			 * for the editor.
			 *
			 * @return jQuery.sceditor.rangeHelper
			 * @function
			 * @name getRangeHelper
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.getRangeHelper = function () {
				return rangeHelper;
			};

			/**
			 * Gets the source editors textarea.
			 *
			 * This shouldn't be used to insert text
			 *
			 * @return {jQuery}
			 * @function
			 * @since 1.4.5
			 * @name sourceEditorCaret
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.sourceEditorCaret = function (position) {
				var ret = {};

				sourceEditor.focus();

				if (position) {
					sourceEditor.selectionStart = position.start;
					sourceEditor.selectionEnd   = position.end;
				} else {
					ret.start = sourceEditor.selectionStart;
					ret.end   = sourceEditor.selectionEnd;
				}

				return position ? this : ret;
			};

			/**
			 * <p>Gets the value of the editor.</p>
			 *
			 * <p>If the editor is in WYSIWYG mode it will return the filtered
			 * HTML from it (converted to BBCode if using the BBCode plugin).
			 * It it's in Source Mode it will return the unfiltered contents
			 * of the source editor (if using the BBCode plugin this will be
			 * BBCode again).</p>
			 *
			 * @since 1.3.5
			 * @return {string}
			 * @function
			 * @name val
			 * @memberOf jQuery.sceditor.prototype
			 */
			/**
			 * <p>Sets the value of the editor.</p>
			 *
			 * <p>If filter set true the val will be passed through the filter
			 * function. If using the BBCode plugin it will pass the val to
			 * the BBCode filter to convert any BBCode into HTML.</p>
			 *
			 * @param {String} val
			 * @param {Boolean} [filter=true]
			 * @return {this}
			 * @since 1.3.5
			 * @function
			 * @name val^2
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.val = function (val, filter) {
				if (typeof val !== 'string') {
					return base.inSourceMode() ?
						base.getSourceEditorValue(false) :
						base.getWysiwygEditorValue(filter);
				}

				if (!base.inSourceMode()) {
					if (filter !== false &&
						pluginManager.hasHandler('toWysiwyg')) {
						val = pluginManager.callOnlyFirst('toWysiwyg', val);
					}

					base.setWysiwygEditorValue(val);
				} else {
					base.setSourceEditorValue(val);
				}

				return base;
			};

			/**
			 * <p>Inserts HTML/BBCode into the editor</p>
			 *
			 * <p>If end is supplied any selected text will be placed between
			 * start and end. If there is no selected text start and end
			 * will be concatenate together.</p>
			 *
			 * <p>If the filter param is set to true, the HTML/BBCode will be
			 * passed through any plugin filters. If using the BBCode plugin
			 * this will convert any BBCode into HTML.</p>
			 *
			 * @param {String} start
			 * @param {String} [end=null]
			 * @param {Boolean} [filter=true]
			 * @param {Boolean} [convertEmoticons=true] If to convert emoticons
			 * @return {this}
			 * @since 1.3.5
			 * @function
			 * @name insert
			 * @memberOf jQuery.sceditor.prototype
			 */
			/**
			 * <p>Inserts HTML/BBCode into the editor</p>
			 *
			 * <p>If end is supplied any selected text will be placed between
			 * start and end. If there is no selected text start and end
			 * will be concatenate together.</p>
			 *
			 * <p>If the filter param is set to true, the HTML/BBCode will be
			 * passed through any plugin filters. If using the BBCode plugin
			 * this will convert any BBCode into HTML.</p>
			 *
			 * <p>If the allowMixed param is set to true, HTML any will not be
			 * escaped</p>
			 *
			 * @param {String} start
			 * @param {String} [end=null]
			 * @param {Boolean} [filter=true]
			 * @param {Boolean} [convertEmoticons=true] If to convert emoticons
			 * @param {Boolean} [allowMixed=false]
			 * @return {this}
			 * @since 1.4.3
			 * @function
			 * @name insert^2
			 * @memberOf jQuery.sceditor.prototype
			 */
			// eslint-disable-next-line max-params
			base.insert = function (
				start, end, filter, convertEmoticons, allowMixed
			) {
				if (base.inSourceMode()) {
					base.sourceEditorInsertText(start, end);
					return base;
				}

				// Add the selection between start and end
				if (end) {
					var	html = rangeHelper.selectedHtml(),
						$div = $('<div>').appendTo($('body')).hide().html(html);

					if (filter !== false && pluginManager.hasHandler('toSource')) {
						html = pluginManager.callOnlyFirst('toSource', html, $div);
					}

					$div.remove();

					start += html + end;
				}
	// TODO: This filter should allow empty tags as it's inserting.
				if (filter !== false && pluginManager.hasHandler('toWysiwyg')) {
					start = pluginManager.callOnlyFirst('toWysiwyg', start, true);
				}

				// Convert any escaped HTML back into HTML if mixed is allowed
				if (filter !== false && allowMixed === true) {
					start = start.replace(/&lt;/g, '<')
						.replace(/&gt;/g, '>')
						.replace(/&amp;/g, '&');
				}

				base.wysiwygEditorInsertHtml(start);

				return base;
			};

			/**
			 * Gets the WYSIWYG editors HTML value.
			 *
			 * If using a plugin that filters the Ht Ml like the BBCode plugin
			 * it will return the result of the filtering (BBCode) unless the
			 * filter param is set to false.
			 *
			 * @param {bool} [filter=true]
			 * @return {string}
			 * @function
			 * @name getWysiwygEditorValue
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.getWysiwygEditorValue = function (filter) {
				var	html;
				// Create a tmp node to store contents so it can be modified
				// without affecting anything else.
				var $tmp = $('<div>', $wysiwygDoc[0])
					.append($($wysiwygBody[0].childNodes).clone())
					.appendTo($wysiwygBody);

				dom.fixNesting($tmp[0]);

				html = $tmp.html();

				// filter the HTML and DOM through any plugins
				if (filter !== false && pluginManager.hasHandler('toSource')) {
					html = pluginManager.callOnlyFirst('toSource', html, $tmp);
				}

				$tmp.remove();

				return html;
			};

			/**
			 * Gets the WYSIWYG editor's iFrame Body.
			 *
			 * @return {jQuery}
			 * @function
			 * @since 1.4.3
			 * @name getBody
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.getBody = function () {
				return $wysiwygBody;
			};

			/**
			 * Gets the WYSIWYG editors container area (whole iFrame).
			 *
			 * @return {Node}
			 * @function
			 * @since 1.4.3
			 * @name getContentAreaContainer
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.getContentAreaContainer = function () {
				return $wysiwygEditor;
			};

			/**
			 * Gets the text editor value
			 *
			 * If using a plugin that filters the text like the BBCode plugin
			 * it will return the result of the filtering which is BBCode to
			 * HTML so it will return HTML. If filter is set to false it will
			 * just return the contents of the source editor (BBCode).
			 *
			 * @param {bool} [filter=true]
			 * @return {string}
			 * @function
			 * @since 1.4.0
			 * @name getSourceEditorValue
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.getSourceEditorValue = function (filter) {
				var val = $sourceEditor.val();

				if (filter !== false && pluginManager.hasHandler('toWysiwyg')) {
					val = pluginManager.callOnlyFirst('toWysiwyg', val);
				}

				return val;
			};

			/**
			 * Sets the WYSIWYG HTML editor value. Should only be the HTML
			 * contained within the body tags
			 *
			 * @param {string} value
			 * @function
			 * @name setWysiwygEditorValue
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.setWysiwygEditorValue = function (value) {
				if (!value) {
					value = '<p>' + (IE_VER ? '' : '<br />') + '</p>';
				}

				$wysiwygBody[0].innerHTML = value;
				replaceEmoticons($wysiwygBody[0]);

				appendNewLine();
				triggerValueChanged();
				autoExpand();
			};

			/**
			 * Sets the text editor value
			 *
			 * @param {string} value
			 * @function
			 * @name setSourceEditorValue
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.setSourceEditorValue = function (value) {
				$sourceEditor.val(value);

				triggerValueChanged();
			};

			/**
			 * Updates the textarea that the editor is replacing
			 * with the value currently inside the editor.
			 *
			 * @function
			 * @name updateOriginal
			 * @since 1.4.0
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.updateOriginal = function () {
				$original.val(base.val());
			};

			/**
			 * Replaces any emoticon codes in the passed HTML
			 * with their emoticon images
			 * @private
			 */
			replaceEmoticons = function (node) {
	// TODO: Make this tag configurable.
				if (!options.emoticonsEnabled || $(node).parents('code').length) {
					return;
				}

				var	doc           = node.ownerDocument,
					whitespace    = '\\s|\xA0|\u2002|\u2003|\u2009|&nbsp;',
					emoticonCodes = [],
					emoticonRegex = {},
					emoticons     = $.extend(
						{},
						options.emoticons.more,
						options.emoticons.dropdown,
						options.emoticons.hidden
					);
	// TODO: cache the emoticonCodes and emoticonCodes objects and share them with
	// the AYT converstion

				$.each(emoticons, function (key) {
					if (options.emoticonsCompat) {
						emoticonRegex[key] = new RegExp(
							'(>|^|' + whitespace + ')' +
							escape.regex(key) +
							'($|<|' + whitespace + ')'
						);
					}

					emoticonCodes.push(key);
				});

				// Sort keys shortest to longest (so can replace in reverse loop)
				emoticonCodes.sort(function (a, b) {
					return a.length - b.length;
				});

	// TODO: tidy below
				var convertEmoticons = function (node) {
					node = node.firstChild;

					while (node) {
						var	parts, key, emoticon, parsedHtml,
							emoticonIdx, nextSibling, matchPos,
							nodeParent  = node.parentNode,
							nodeValue   = node.nodeValue;

						// All none textnodes
						if (node.nodeType !== 3) {
	// TODO: Make this tag configurable.
							if (!$(node).is('code')) {
								convertEmoticons(node);
							}
						} else if (nodeValue) {
							emoticonIdx = emoticonCodes.length;
							while (emoticonIdx--) {
								key      = emoticonCodes[emoticonIdx];
								matchPos = options.emoticonsCompat ?
									nodeValue.search(emoticonRegex[key]) :
									nodeValue.indexOf(key);

								if (matchPos > -1) {
									nextSibling    = node.nextSibling;
									emoticon       = emoticons[key];
									parts          = nodeValue
										.substr(matchPos).split(key);
									nodeValue      = nodeValue
										.substr(0, matchPos) + parts.shift();
									node.nodeValue = nodeValue;

									parsedHtml = dom.parseHTML(_tmpl('emoticon', {
										key: key,
										url: emoticon.url || emoticon,
										tooltip: emoticon.tooltip || key
									}), doc);

									nodeParent.insertBefore(
										parsedHtml[0],
										nextSibling
									);

									nodeParent.insertBefore(
										doc.createTextNode(parts.join(key)),
										nextSibling
									);
								}
							}
						}

						node = node.nextSibling;
					}
				};

				convertEmoticons(node);

				if (options.emoticonsCompat) {
					currentEmoticons = $wysiwygBody
						.find('img[data-sceditor-emoticon]');
				}
			};

			/**
			 * If the editor is in source code mode
			 *
			 * @return {bool}
			 * @function
			 * @name inSourceMode
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.inSourceMode = function () {
				return $editorContainer.hasClass('sourceMode');
			};

			/**
			 * Gets if the editor is in sourceMode
			 *
			 * @return boolean
			 * @function
			 * @name sourceMode
			 * @memberOf jQuery.sceditor.prototype
			 */
			/**
			 * Sets if the editor is in sourceMode
			 *
			 * @param {bool} enable
			 * @return {this}
			 * @function
			 * @name sourceMode^2
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.sourceMode = function (enable) {
				var inSourceMode = base.inSourceMode();

				if (typeof enable !== 'boolean') {
					return inSourceMode;
				}

				if ((inSourceMode && !enable) || (!inSourceMode && enable)) {
					base.toggleSourceMode();
				}

				return base;
			};

			/**
			 * Switches between the WYSIWYG and source modes
			 *
			 * @function
			 * @name toggleSourceMode
			 * @since 1.4.0
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.toggleSourceMode = function () {
				var sourceMode = base.inSourceMode();

				// don't allow switching to WYSIWYG if doesn't support it
				if (!browser.isWysiwygSupported && sourceMode) {
					return;
				}

				if (!sourceMode) {
					rangeHelper.saveRange();
					rangeHelper.clear();
				}

				base.blur();

				if (sourceMode) {
					base.setWysiwygEditorValue(base.getSourceEditorValue());
				} else {
					base.setSourceEditorValue(base.getWysiwygEditorValue());
				}

				lastRange = null;
				$sourceEditor.toggle();
				$wysiwygEditor.toggle();
				$editorContainer
					.toggleClass('wysiwygMode', sourceMode)
					.toggleClass('sourceMode', !sourceMode);

				updateToolBar();
				updateActiveButtons();
			};

			/**
			 * Gets the selected text of the source editor
			 * @return {String}
			 * @private
			 */
			sourceEditorSelectedText = function () {
				sourceEditor.focus();

				if (typeof sourceEditor.selectionStart !== 'undefined') {
					return sourceEditor.value.substring(
						sourceEditor.selectionStart,
						sourceEditor.selectionEnd
					);
				} else {
					return globalDoc.selection.createRange().text;
				}
			};

			/**
			 * Handles the passed command
			 * @private
			 */
			handleCommand = function (caller, cmd) {
				// check if in text mode and handle text commands
				if (base.inSourceMode()) {
					if (cmd.txtExec) {
						if ($.isArray(cmd.txtExec)) {
							base.sourceEditorInsertText.apply(base, cmd.txtExec);
						} else {
							cmd.txtExec.call(
								base,
								caller,
								sourceEditorSelectedText()
							);
						}
					}
				} else if (cmd.exec) {
					if ($.isFunction(cmd.exec)) {
						cmd.exec.call(base, caller);
					} else {
						base.execCommand(
							cmd.exec,
							cmd.hasOwnProperty('execParam') ?
								cmd.execParam : null
						);
					}
				}

			};

			/**
			 * Saves the current range. Needed for IE because it forgets
			 * where the cursor was and what was selected
			 * @private
			 */
			saveRange = function () {
				/* this is only needed for IE */
				if (IE_VER) {
					lastRange = rangeHelper.selectedRange();
				}
			};

			/**
			 * Executes a command on the WYSIWYG editor
			 *
			 * @param {String} command
			 * @param {String|Boolean} [param]
			 * @function
			 * @name execCommand
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.execCommand = function (command, param) {
				var	executed    = false,
					commandObj  = base.commands[command],
					$parentNode = $(rangeHelper.parentNode());

				base.focus();

	// TODO: make configurable
				// don't apply any commands to code elements
				if ($parentNode.is('code') ||
					$parentNode.parents('code').length !== 0) {
					return;
				}

				try {
					executed = $wysiwygDoc[0].execCommand(command, false, param);
				} catch (ex) { }

				// show error if execution failed and an error message exists
				if (!executed && commandObj && commandObj.errorMessage) {
					/*global alert:false*/
					alert(base._(commandObj.errorMessage));
				}

				updateActiveButtons();
			};

			/**
			 * Checks if the current selection has changed and triggers
			 * the selectionchanged event if it has.
			 *
			 * In browsers other than IE, it will check at most once every 100ms.
			 * This is because only IE has a selection changed event.
			 * @private
			 */
			checkSelectionChanged = function () {
				function check() {
					// rangeHelper could be null if editor was destroyed
					// before the timeout had finished
					if (rangeHelper && !rangeHelper.compare(currentSelection)) {
						currentSelection = rangeHelper.cloneSelected();

						// If the selection is in an inline wrap it in a block.
						// Fixes #331
						if (currentSelection && currentSelection.collapsed) {
							var parent = currentSelection.startContainer;
							var offset = currentSelection.startOffset;

							// Handle if selection is placed before/after an element
							if (offset && parent.nodeType !== 3) {
								parent = parent.childNodes[offset];
							}

							while (parent && parent.parentNode !== $wysiwygBody) {
								parent = parent.parentNode;
							}

							if (parent && dom.isInline(parent, true)) {
								rangeHelper.saveRange();
								wrapInlines($wysiwygBody, $wysiwygDoc);
								rangeHelper.restoreRange();
							}
						}

						$editorContainer.trigger($.Event('selectionchanged'));
					}

					isSelectionCheckPending = false;
				}

				if (isSelectionCheckPending) {
					return;
				}

				isSelectionCheckPending = true;

				// Don't do limit checking if browser supports the Selection API
				if ('onselectionchange' in $wysiwygDoc) {
					check();
				} else {
					setTimeout(check, 100);
				}
			};

			/**
			 * Checks if the current node has changed and triggers
			 * the nodechanged event if it has
			 * @private
			 */
			checkNodeChanged = function () {
				// check if node has changed
				var	oldNode,
					node = rangeHelper.parentNode();

				if (currentNode !== node) {
					oldNode          = currentNode;
					currentNode      = node;
					currentBlockNode = rangeHelper.getFirstBlockParent(node);

					$editorContainer.trigger($.Event('nodechanged', {
						oldNode: oldNode,
						newNode: currentNode
					}));
				}
			};

			/**
			 * <p>Gets the current node that contains the selection/caret in
			 * WYSIWYG mode.</p>
			 *
			 * <p>Will be null in sourceMode or if there is no selection.</p>
			 * @return {Node}
			 * @function
			 * @name currentNode
			 * @memberOf jQuery.sceditor.prototype
			 */
			base.currentNode = function () {
				return currentNode;
			};

			/**
			 * <p>Gets the first block level node that contains the
			 * selection/caret in WYSIWYG mode.</p>
			 *
			 * <p>Will be null in sourceMode or if there is no selection.</p>
			 * @return {Node}
			 * @function
			 * @name currentBlockNode
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.4
			 */
			base.currentBlockNode = function () {
				return currentBlockNode;
			};

			/**
			 * Updates if buttons are active or not
			 * @private
			 */
			updateActiveButtons = function (e) {
				var firstBlock, parent;
				var activeClass = 'active';
				var doc         = $wysiwygDoc[0];
				var isSource    = base.sourceMode();

				if (base.readOnly()) {
					$toolbar.find(activeClass).removeClass(activeClass);
					return;
				}

				if (!isSource) {
					parent     = e ? e.newNode : rangeHelper.parentNode();
					firstBlock = rangeHelper.getFirstBlockParent(parent);
				}

				for (var i = 0; i < btnStateHandlers.length; i++) {
					var state      = 0;
					var $btn       = toolbarButtons[btnStateHandlers[i].name];
					var stateFn    = btnStateHandlers[i].state;
					var isDisabled = (isSource && !$btn.data('sceditor-txtmode')) ||
								(!isSource && !$btn.data('sceditor-wysiwygmode'));

					if (typeof stateFn === 'string') {
						if (!isSource) {
							try {
								state = doc.queryCommandEnabled(stateFn) ? 0 : -1;

								// eslint-disable-next-line max-depth
								if (state > -1) {
									state = doc.queryCommandState(stateFn) ? 1 : 0;
								}
							} catch (ex) {}
						}
					} else if (!isDisabled) {
						state = stateFn.call(base, parent, firstBlock);
					}

					$btn
						.toggleClass('disabled', isDisabled || state < 0)
						.toggleClass(activeClass, state > 0);
				}
			};

			/**
			 * Handles any key press in the WYSIWYG editor
			 *
			 * @private
			 */
			handleKeyPress = function (e) {
				// FF bug: https://bugzilla.mozilla.org/show_bug.cgi?id=501496
				if (e.originalEvent.defaultPrevented) {
					return;
				}

				base.closeDropDown();

				// 13 = enter key
				if (e.which === 13) {
					var LIST_TAGS = 'li,ul,ol';
					var $currentTag = $(currentBlockNode);

					// "Fix" (cludge) for blocklevel elements being duplicated in
					// some browsers when enter is pressed instead of inserting a
					// newline
					if ($currentTag.length &&
						!$currentTag.is(LIST_TAGS)) {
						lastRange = null;

						var br = $wysiwygDoc[0].createElement('br');
						rangeHelper.insertNode(br);

						// Last <br> of a block will be collapsed unless it is
						// IE < 11 so need to make sure the <br> that was inserted
						// isn't the last node of a block.
						if (!IE_BR_FIX) {
							var parent    = br.parentNode;
							var lastChild = parent.lastChild;

							// Sometimes an empty next node is created after the<br>
							if (lastChild && lastChild.nodeType === 3 &&
								lastChild.nodeValue === '') {
								parent.removeChild(lastChild);
								lastChild = parent.lastChild;
							}

							// If this is the last BR of a block and the previous
							// sibling is inline then will need an extra BR. This
							// is needed because the last BR of a block will be
							// collapsed. Fixes issue #248
							if (!dom.isInline(parent, true) && lastChild === br &&
								dom.isInline(br.previousSibling)) {
								rangeHelper.insertHTML('<br>');
							}
						}

						e.preventDefault();
					}
				}
			};

			/**
			 * Makes sure that if there is a code or quote tag at the
			 * end of the editor, that there is a new line after it.
			 *
			 * If there wasn't a new line at the end you wouldn't be able
			 * to enter any text after a code/quote tag
			 * @return {void}
			 * @private
			 */
			appendNewLine = function () {
				var name,
					wysiwygBody = $wysiwygBody[0];

				// Check all nodes in reverse until either add a new line
				// or reach a non-empty textnode or BR at which point can
				// stop checking.
				dom.rTraverse(wysiwygBody, function (node) {
					name = node.nodeName.toLowerCase();

					// Last block, add new line after if has styling
					if (node.nodeType === 1 &&
						!/inline/.test(dom.getStyle(node, 'display'))) {

						// Add line break after if has styling
						if ($(node).hasClass('sceditor-nlf') &&
							dom.hasStyling(node)) {
							var paragraph = $wysiwygDoc[0].createElement('p');
							paragraph.className = 'sceditor-nlf';
							paragraph.innerHTML = !IE_BR_FIX ? '<br />' : '';
							wysiwygBody.appendChild(paragraph);
							return false;
						}
					}

					// Last non-empty text node or line break.
					// No need to add line-break after them
					if ((node.nodeType === 3 && !/^\s*$/.test(node.nodeValue)) ||
						name === 'br') {
						return false;
					}
				});
			};

			/**
			 * Handles form reset event
			 * @private
			 */
			handleFormReset = function () {
				base.val($original.val());
			};

			/**
			 * Handles any mousedown press in the WYSIWYG editor
			 * @private
			 */
			handleMouseDown = function () {
				base.closeDropDown();
				lastRange = null;
			};

			/**
			 * Handles the window resize event. Needed to resize then editor
			 * when the window size changes in fluid designs.
			 * @ignore
			 */
			handleWindowResize = function () {
				var	height = options.height,
					width  = options.width;

				if (!base.maximize()) {
					if ((height && height.toString().indexOf('%') > -1) ||
						(width && width.toString().indexOf('%') > -1)) {
						base.dimensions(width, height);
					}
				} else {
					base.dimensions('100%', '100%', false);
				}
			};

			/**
			 * Translates the string into the locale language.
			 *
			 * Replaces any {0}, {1}, {2}, ect. with the params provided.
			 *
			 * @param {string} str
			 * @param {...String} args
			 * @return {string}
			 * @function
			 * @name _
			 * @memberOf jQuery.sceditor.prototype
			 */
			base._ = function () {
				var	undef,
					args = arguments;

				if (locale && locale[args[0]]) {
					args[0] = locale[args[0]];
				}

				return args[0].replace(/\{(\d+)\}/g, function (str, p1) {
					return args[p1 - 0 + 1] !== undef ?
						args[p1 - 0 + 1] :
						'{' + p1 + '}';
				});
			};

			/**
			 * Passes events on to any handlers
			 * @private
			 * @return void
			 */
			handleEvent = function (e) {
				// Send event to all plugins
				pluginManager.call(e.type + 'Event', e, base);

				// convert the event into a custom event to send
				var prefix       = e.target === sourceEditor ? 'scesrc' : 'scewys';
				var customEvent  = $.Event(e);
				customEvent.type = prefix + e.type;

				$editorContainer.trigger(customEvent, base);
			};

			/**
			 * <p>Binds a handler to the specified events</p>
			 *
			 * <p>This function only binds to a limited list of
			 * supported events.<br />
			 * The supported events are:
			 * <ul>
			 *   <li>keyup</li>
			 *   <li>keydown</li>
			 *   <li>Keypress</li>
			 *   <li>blur</li>
			 *   <li>focus</li>
			 *   <li>nodechanged<br />
			 *       When the current node containing the selection changes
			 *       in WYSIWYG mode</li>
			 *   <li>contextmenu</li>
			 *   <li>selectionchanged</li>
			 *   <li>valuechanged</li>
			 * </ul>
			 * </p>
			 *
			 * <p>The events param should be a string containing the event(s)
			 * to bind this handler to. If multiple, they should be separated
			 * by spaces.</p>
			 *
			 * @param  {String} events
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  if to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name bind
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.bind = function (events, handler, excludeWysiwyg, excludeSource) {
				events = events.split(' ');

				var i  = events.length;
				while (i--) {
					if ($.isFunction(handler)) {
						// Use custom events to allow passing the instance as the
						// 2nd argument.
						// Also allows unbinding without unbinding the editors own
						// event handlers.
						if (!excludeWysiwyg) {
							$editorContainer.on('scewys' + events[i], handler);
						}

						if (!excludeSource) {
							$editorContainer.on('scesrc' + events[i], handler);
						}

						// Start sending value changed events
						if (events[i] === 'valuechanged') {
							triggerValueChanged.hasHandler = true;
						}
					}
				}

				return base;
			};

			/**
			 * Unbinds an event that was bound using bind().
			 *
			 * @param  {String} events
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude unbinding this
			 *                                  handler from the WYSIWYG editor
			 * @param  {Boolean} excludeSource  if to exclude unbinding this
			 *                                  handler from the source editor
			 * @return {this}
			 * @function
			 * @name unbind
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 * @see bind
			 */
			base.unbind = function (events,handler,excludeWysiwyg,excludeSource) {
				events = events.split(' ');

				var i  = events.length;
				while (i--) {
					if ($.isFunction(handler)) {
						if (!excludeWysiwyg) {
							$editorContainer.off('scewys' + events[i], handler);
						}

						if (!excludeSource) {
							$editorContainer.off('scesrc' + events[i], handler);
						}
					}
				}

				return base;
			};

			/**
			 * Blurs the editors input area
			 *
			 * @return {this}
			 * @function
			 * @name blur
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.3.6
			 */
			/**
			 * Adds a handler to the editors blur event
			 *
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  if to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name blur^2
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.blur = function (handler, excludeWysiwyg, excludeSource) {
				if ($.isFunction(handler)) {
					base.bind('blur', handler, excludeWysiwyg, excludeSource);
				} else if (!base.sourceMode()) {
					$wysiwygBody.blur();
				} else {
					$sourceEditor.blur();
				}

				return base;
			};

			/**
			 * Focuses the editors input area
			 *
			 * @return {this}
			 * @function
			 * @name focus
			 * @memberOf jQuery.sceditor.prototype
			 */
			/**
			 * Adds an event handler to the focus event
			 *
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  if to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name focus^2
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.focus = function (handler, excludeWysiwyg, excludeSource) {
				if ($.isFunction(handler)) {
					base.bind('focus', handler, excludeWysiwyg, excludeSource);
				} else if (!base.inSourceMode()) {
					// Already has focus so do nothing
					//if (rangeHelper.hasSelection()) {
					//	return;
					//}

					var container,
						rng = rangeHelper.selectedRange();

					// Fix FF bug where it shows the cursor in the wrong place
					// if the editor hasn't had focus before. See issue #393
					if (!currentSelection) {
						autofocus();
					}

					// Check if cursor is set after a BR when the BR is the only
					// child of the parent. In Firefox this causes a line break
					// to occur when something is typed. See issue #321
					if (!IE_BR_FIX && rng && rng.endOffset === 1 && rng.collapsed) {
						container = rng.endContainer;

						if (container && container.childNodes.length === 1 &&
							$(container.firstChild).is('br')) {
							rng.setStartBefore(container.firstChild);
							rng.collapse(true);
							rangeHelper.selectRange(rng);
						}
					}

					wysiwygEditor.contentWindow.focus();
					$wysiwygBody[0].focus();

					// Needed for IE
					if (lastRange) {
						rangeHelper.selectRange(lastRange);

						// Remove the stored range after being set.
						// If the editor loses focus it should be saved again.
						lastRange = null;
					}
				} else {
					sourceEditor.focus();
				}

				updateActiveButtons();

				return base;
			};

			/**
			 * Adds a handler to the key down event
			 *
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  If to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name keyDown
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.keyDown = function (handler, excludeWysiwyg, excludeSource) {
				return base.bind('keydown', handler, excludeWysiwyg, excludeSource);
			};

			/**
			 * Adds a handler to the key press event
			 *
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  If to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name keyPress
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.keyPress = function (handler, excludeWysiwyg, excludeSource) {
				return base
					.bind('keypress', handler, excludeWysiwyg, excludeSource);
			};

			/**
			 * Adds a handler to the key up event
			 *
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  If to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name keyUp
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.keyUp = function (handler, excludeWysiwyg, excludeSource) {
				return base.bind('keyup', handler, excludeWysiwyg, excludeSource);
			};

			/**
			 * <p>Adds a handler to the node changed event.</p>
			 *
			 * <p>Happens whenever the node containing the selection/caret
			 * changes in WYSIWYG mode.</p>
			 *
			 * @param  {Function} handler
			 * @return {this}
			 * @function
			 * @name nodeChanged
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.nodeChanged = function (handler) {
				return base.bind('nodechanged', handler, false, true);
			};

			/**
			 * <p>Adds a handler to the selection changed event</p>
			 *
			 * <p>Happens whenever the selection changes in WYSIWYG mode.</p>
			 *
			 * @param  {Function} handler
			 * @return {this}
			 * @function
			 * @name selectionChanged
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.1
			 */
			base.selectionChanged = function (handler) {
				return base.bind('selectionchanged', handler, false, true);
			};

			/**
			 * <p>Adds a handler to the value changed event</p>
			 *
			 * <p>Happens whenever the current editor value changes.</p>
			 *
			 * <p>Whenever anything is inserted, the value changed or
			 * 1.5 secs after text is typed. If a space is typed it will
			 * cause the event to be triggered immediately instead of
			 * after 1.5 seconds</p>
			 *
			 * @param  {Function} handler
			 * @param  {Boolean} excludeWysiwyg If to exclude adding this handler
			 *                                  to the WYSIWYG editor
			 * @param  {Boolean} excludeSource  If to exclude adding this handler
			 *                                  to the source editor
			 * @return {this}
			 * @function
			 * @name valueChanged
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.5
			 */
			base.valueChanged = function (handler, excludeWysiwyg, excludeSource) {
				return base
					.bind('valuechanged', handler, excludeWysiwyg, excludeSource);
			};

			/**
			 * Emoticons keypress handler
			 * @private
			 */
			emoticonsKeyPress = function (e) {
				var	replacedEmoticon,
					cachePos       = 0,
					emoticonsCache = base.emoticonsCache,
					curChar        = String.fromCharCode(e.which);
	// TODO: Make configurable
				if ($(currentBlockNode).is('code') ||
					$(currentBlockNode).parents('code').length) {
					return;
				}

				if (!emoticonsCache) {
					emoticonsCache = [];

					$.each($.extend(
						{},
						options.emoticons.more,
						options.emoticons.dropdown,
						options.emoticons.hidden
					), function (key, url) {
						emoticonsCache[cachePos++] = [
							key,
							_tmpl('emoticon', {
								key: key,
								url: url.url || url,
								tooltip: url.tooltip || key
							})
						];
					});

					emoticonsCache.sort(function (a, b) {
						return a[0].length - b[0].length;
					});

					base.emoticonsCache = emoticonsCache;
					base.longestEmoticonCode =
						emoticonsCache[emoticonsCache.length - 1][0].length;
				}

				replacedEmoticon = rangeHelper.replaceKeyword(
					base.emoticonsCache,
					true,
					true,
					base.longestEmoticonCode,
					options.emoticonsCompat,
					curChar
				);

				if (replacedEmoticon && options.emoticonsCompat) {
					currentEmoticons = $wysiwygBody
						.find('img[data-sceditor-emoticon]');

					return /^\s$/.test(curChar);
				}

				return !replacedEmoticon;
			};

			/**
			 * Makes sure emoticons are surrounded by whitespace
			 * @private
			 */
			emoticonsCheckWhitespace = function () {
				if (!currentEmoticons.length) {
					return;
				}

				var	prev, next, parent, range, previousText, rangeStartContainer,
					currentBlock = base.currentBlockNode(),
					rangeStart   = false,
					noneWsRegex  = /[^\s\xA0\u2002\u2003\u2009\u00a0]+/;

				currentEmoticons = $.map(currentEmoticons, function (emoticon) {
					// Ignore emoticons that have been removed from DOM
					if (!emoticon || !emoticon.parentNode) {
						return null;
					}

					if (!$.contains(currentBlock, emoticon)) {
						return emoticon;
					}

					prev         = emoticon.previousSibling;
					next         = emoticon.nextSibling;
					previousText = prev.nodeValue;

					// For IE's HTMLPhraseElement
					if (previousText === null) {
						previousText = prev.innerText || '';
					}

					if ((!prev || !noneWsRegex.test(prev.nodeValue.slice(-1))) &&
						(!next || !noneWsRegex.test((next.nodeValue || '')[0]))) {
						return emoticon;
					}

					parent              = emoticon.parentNode;
					range               = rangeHelper.cloneSelected();
					rangeStartContainer = range.startContainer;
					previousText        = previousText +
						$(emoticon).data('sceditor-emoticon');

					// Store current caret position
					if (rangeStartContainer === next) {
						rangeStart = previousText.length + range.startOffset;
					} else if (rangeStartContainer === currentBlock &&
						currentBlock.childNodes[range.startOffset] === next) {
						rangeStart = previousText.length;
					} else if (rangeStartContainer === prev) {
						rangeStart = range.startOffset;
					}

					if (!next || next.nodeType !== 3) {
						next = parent.insertBefore(
							parent.ownerDocument.createTextNode(''), next
						);
					}

					next.insertData(0, previousText);
					parent.removeChild(prev);
					parent.removeChild(emoticon);

					// Need to update the range starting
					// position if it has been modified
					if (rangeStart !== false) {
						range.setStart(next, rangeStart);
						range.collapse(true);
						rangeHelper.selectRange(range);
					}

					return null;
				});
			};

			/**
			 * Gets if emoticons are currently enabled
			 * @return {boolean}
			 * @function
			 * @name emoticons
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.2
			 */
			/**
			 * Enables/disables emoticons
			 *
			 * @param {boolean} enable
			 * @return {this}
			 * @function
			 * @name emoticons^2
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.2
			 */
			base.emoticons = function (enable) {
				if (!enable && enable !== false) {
					return options.emoticonsEnabled;
				}

				options.emoticonsEnabled = enable;

				if (enable) {
					$wysiwygBody.keypress(emoticonsKeyPress);

					if (!base.sourceMode()) {
						rangeHelper.saveRange();

						replaceEmoticons($wysiwygBody[0]);
						currentEmoticons = $wysiwygBody
							.find('img[data-sceditor-emoticon]');
						triggerValueChanged(false);

						rangeHelper.restoreRange();
					}
				} else {
					$wysiwygBody
						.find('img[data-sceditor-emoticon]')
						.replaceWith(function () {
							return $(this).data('sceditor-emoticon');
						});

					currentEmoticons = [];
					$wysiwygBody.off('keypress', emoticonsKeyPress);

					triggerValueChanged();
				}

				return base;
			};

			/**
			 * Gets the current WYSIWYG editors inline CSS
			 *
			 * @return {string}
			 * @function
			 * @name css
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.3
			 */
			/**
			 * Sets inline CSS for the WYSIWYG editor
			 *
			 * @param {string} css
			 * @return {this}
			 * @function
			 * @name css^2
			 * @memberOf jQuery.sceditor.prototype
			 * @since 1.4.3
			 */
			base.css = function (css) {
				if (!inlineCss) {
					inlineCss = $('<style id="#inline" />', $wysiwygDoc[0])
						.appendTo($wysiwygDoc.find('head'))[0];
				}

				if (typeof css !== 'string') {
					return inlineCss.styleSheet ?
						inlineCss.styleSheet.cssText : inlineCss.innerHTML;
				}

				if (inlineCss.styleSheet) {
					inlineCss.styleSheet.cssText = css;
				} else {
					inlineCss.innerHTML = css;
				}

				return base;
			};

			/**
			 * Handles the keydown event, used for shortcuts
			 * @private
			 */
			handleKeyDown = function (e) {
				var	shortcut   = [],
					SHIFT_KEYS = {
						'`': '~',
						'1': '!',
						'2': '@',
						'3': '#',
						'4': '$',
						'5': '%',
						'6': '^',
						'7': '&',
						'8': '*',
						'9': '(',
						'0': ')',
						'-': '_',
						'=': '+',
						';': ': ',
						'\'': '"',
						',': '<',
						'.': '>',
						'/': '?',
						'\\': '|',
						'[': '{',
						']': '}'
					},
					SPECIAL_KEYS = {
						8: 'backspace',
						9: 'tab',
						13: 'enter',
						19: 'pause',
						20: 'capslock',
						27: 'esc',
						32: 'space',
						33: 'pageup',
						34: 'pagedown',
						35: 'end',
						36: 'home',
						37: 'left',
						38: 'up',
						39: 'right',
						40: 'down',
						45: 'insert',
						46: 'del',
						91: 'win',
						92: 'win',
						93: 'select',
						96: '0',
						97: '1',
						98: '2',
						99: '3',
						100: '4',
						101: '5',
						102: '6',
						103: '7',
						104: '8',
						105: '9',
						106: '*',
						107: '+',
						109: '-',
						110: '.',
						111: '/',
						112: 'f1',
						113: 'f2',
						114: 'f3',
						115: 'f4',
						116: 'f5',
						117: 'f6',
						118: 'f7',
						119: 'f8',
						120: 'f9',
						121: 'f10',
						122: 'f11',
						123: 'f12',
						144: 'numlock',
						145: 'scrolllock',
						186: ';',
						187: '=',
						188: ',',
						189: '-',
						190: '.',
						191: '/',
						192: '`',
						219: '[',
						220: '\\',
						221: ']',
						222: '\''
					},
					NUMPAD_SHIFT_KEYS = {
						109: '-',
						110: 'del',
						111: '/',
						96: '0',
						97: '1',
						98: '2',
						99: '3',
						100: '4',
						101: '5',
						102: '6',
						103: '7',
						104: '8',
						105: '9'
					},
					which     = e.which,
					character = SPECIAL_KEYS[which] ||
						String.fromCharCode(which).toLowerCase();

				if (e.ctrlKey || e.metaKey) {
					shortcut.push('ctrl');
				}

				if (e.altKey) {
					shortcut.push('alt');
				}

				if (e.shiftKey) {
					shortcut.push('shift');

					if (NUMPAD_SHIFT_KEYS[which]) {
						character = NUMPAD_SHIFT_KEYS[which];
					} else if (SHIFT_KEYS[character]) {
						character = SHIFT_KEYS[character];
					}
				}

				// Shift is 16, ctrl is 17 and alt is 18
				if (character && (which < 16 || which > 18)) {
					shortcut.push(character);
				}

				shortcut = shortcut.join('+');
				if (shortcutHandlers[shortcut]) {
					return shortcutHandlers[shortcut].call(base);
				}
			};

			/**
			 * Adds a shortcut handler to the editor
			 * @param  {String}          shortcut
			 * @param  {String|Function} cmd
			 * @return {jQuery.sceditor}
			 */
			base.addShortcut = function (shortcut, cmd) {
				shortcut = shortcut.toLowerCase();

				if (typeof cmd === 'string') {
					shortcutHandlers[shortcut] = function () {
						handleCommand(
							toolbarButtons[cmd],
							base.commands[cmd]
						);

						return false;
					};
				} else {
					shortcutHandlers[shortcut] = cmd;
				}

				return base;
			};

			/**
			 * Removes a shortcut handler
			 * @param  {String} shortcut
			 * @return {jQuery.sceditor}
			 */
			base.removeShortcut = function (shortcut) {
				delete shortcutHandlers[shortcut.toLowerCase()];

				return base;
			};

			/**
			 * Handles the backspace key press
			 *
			 * Will remove block styling like quotes/code ect if at the start.
			 * @private
			 */
			handleBackSpace = function (e) {
				var	node, offset, tmpRange, range, parent;

				// 8 is the backspace key
				if (options.disableBlockRemove || e.which !== 8 ||
					!(range = rangeHelper.selectedRange())) {
					return;
				}

				if (!globalWin.getSelection) {
					node     = range.parentElement();
					tmpRange = $wysiwygDoc[0].selection.createRange();

					// Select the entire parent and set the end
					// as start of the current range
					tmpRange.moveToElementText(node);
					tmpRange.setEndPoint('EndToStart', range);

					// Number of characters selected is the start offset
					// relative to the parent node
					offset = tmpRange.text.length;
				} else {
					node   = range.startContainer;
					offset = range.startOffset;
				}

				if (offset !== 0 || !(parent = currentStyledBlockNode())) {
					return;
				}

				while (node !== parent) {
					while (node.previousSibling) {
						node = node.previousSibling;

						// Everything but empty text nodes before the cursor
						// should prevent the style from being removed
						if (node.nodeType !== 3 || node.nodeValue) {
							return;
						}
					}

					if (!(node = node.parentNode)) {
						return;
					}
				}

				if (!parent || $(parent).is('body')) {
					return;
				}

				// The backspace was pressed at the start of
				// the container so clear the style
				base.clearBlockFormatting(parent);
				return false;
			};

			/**
			 * Gets the first styled block node that contains the cursor
			 * @return {HTMLElement}
			 */
			currentStyledBlockNode = function () {
				var block = currentBlockNode;

				while (!dom.hasStyling(block) || dom.isInline(block, true)) {
					if (!(block = block.parentNode) || $(block).is('body')) {
						return;
					}
				}

				return block;
			};

			/**
			 * Clears the formatting of the passed block element.
			 *
			 * If block is false, if will clear the styling of the first
			 * block level element that contains the cursor.
			 * @param  {HTMLElement} block
			 * @since 1.4.4
			 */
			base.clearBlockFormatting = function (block) {
				block = block || currentStyledBlockNode();

				if (!block || $(block).is('body')) {
					return base;
				}

				rangeHelper.saveRange();

				block.className = '';
				lastRange       = null;

				$(block).attr('style', '');

				if (!$(block).is('p,div,td')) {
					dom.convertElement(block, 'p');
				}

				rangeHelper.restoreRange();
				return base;
			};

			/**
			 * Triggers the valueChanged signal if there is
			 * a plugin that handles it.
			 *
			 * If rangeHelper.saveRange() has already been
			 * called, then saveRange should be set to false
			 * to prevent the range being saved twice.
			 *
			 * @since 1.4.5
			 * @param {Boolean} saveRange If to call rangeHelper.saveRange().
			 * @private
			 */
			triggerValueChanged = function (saveRange) {
				if (!pluginManager ||
					(!pluginManager.hasHandler('valuechangedEvent') &&
						!triggerValueChanged.hasHandler)) {
					return;
				}

				var	currentHtml,
					sourceMode   = base.sourceMode(),
					hasSelection = !sourceMode && rangeHelper.hasSelection();

				// Composition end isn't guaranteed to fire but must have
				// ended when triggerValueChanged() is called so reset it
				isComposing = false;

				// Don't need to save the range if sceditor-start-marker
				// is present as the range is already saved
				saveRange = saveRange !== false &&
					!$wysiwygDoc[0].getElementById('sceditor-start-marker');

				// Clear any current timeout as it's now been triggered
				if (valueChangedKeyUpTimer) {
					clearTimeout(valueChangedKeyUpTimer);
					valueChangedKeyUpTimer = false;
				}

				if (hasSelection && saveRange) {
					rangeHelper.saveRange();
				}

				currentHtml = sourceMode ?
					$sourceEditor.val() :
					$wysiwygBody.html();

				// Only trigger if something has actually changed.
				if (currentHtml !== triggerValueChanged.lastVal) {
					triggerValueChanged.lastVal = currentHtml;

					$editorContainer.trigger($.Event('valuechanged', {
						rawValue: sourceMode ? base.val() : currentHtml
					}));
				}

				if (hasSelection && saveRange) {
					rangeHelper.removeMarkers();
				}
			};

			/**
			 * Should be called whenever there is a blur event
			 * @private
			 */
			valueChangedBlur = function () {
				if (valueChangedKeyUpTimer) {
					triggerValueChanged();
				}
			};

			/**
			 * Should be called whenever there is a keypress event
			 * @param  {Event} e The keypress event
			 * @private
			 */
			valueChangedKeyUp = function (e) {
				var which         = e.which,
					lastChar      = valueChangedKeyUp.lastChar,
					lastWasSpace  = (lastChar === 13 || lastChar === 32),
					lastWasDelete = (lastChar === 8 || lastChar === 46);

				valueChangedKeyUp.lastChar = which;

				if (isComposing) {
					return;
				}

				// 13 = return & 32 = space
				if (which === 13 || which === 32) {
					if (!lastWasSpace) {
						triggerValueChanged();
					} else {
						valueChangedKeyUp.triggerNext = true;
					}
				// 8 = backspace & 46 = del
				} else if (which === 8 || which === 46) {
					if (!lastWasDelete) {
						triggerValueChanged();
					} else {
						valueChangedKeyUp.triggerNext = true;
					}
				} else if (valueChangedKeyUp.triggerNext) {
					triggerValueChanged();
					valueChangedKeyUp.triggerNext = false;
				}

				// Clear the previous timeout and set a new one.
				if (valueChangedKeyUpTimer) {
					clearTimeout(valueChangedKeyUpTimer);
				}

				// Trigger the event 1.5s after the last keypress if space
				// isn't pressed. This might need to be lowered, will need
				// to look into what the slowest average Chars Per Min is.
				valueChangedKeyUpTimer = setTimeout(function () {
					if (!isComposing) {
						triggerValueChanged();
					}
				}, 1500);
			};

			handleComposition = function (e) {
				isComposing = /start/i.test(e.type);

				if (!isComposing) {
					triggerValueChanged();
				}
			};

			autoUpdate = function () {
				base.updateOriginal();
			};

			// run the initializer
			init();
		};


		/**
		 * Map containing the loaded SCEditor locales
		 * @type {Object}
		 * @name locale
		 * @memberOf jQuery.sceditor
		 */
		SCEditor.locale = {};


		/**
		 * Static command helper class
		 * @class command
		 * @name jQuery.sceditor.command
		 */
		SCEditor.command =
		/** @lends jQuery.sceditor.command */
		{
			/**
			 * Gets a command
			 *
			 * @param {String} name
			 * @return {Object|null}
			 * @since v1.3.5
			 */
			get: function (name) {
				return SCEditor.commands[name] || null;
			},

			/**
			 * <p>Adds a command to the editor or updates an existing
			 * command if a command with the specified name already exists.</p>
			 *
			 * <p>Once a command is add it can be included in the toolbar by
			 * adding it's name to the toolbar option in the constructor. It
			 * can also be executed manually by calling
			 * {@link jQuery.sceditor.execCommand}</p>
			 *
			 * @example
			 * SCEditor.command.set("hello",
			 * {
			 *     exec: function () {
			 *         alert("Hello World!");
			 *     }
			 * });
			 *
			 * @param {String} name
			 * @param {Object} cmd
			 * @return {this|false} Returns false if name or cmd is false
			 * @since v1.3.5
			 */
			set: function (name, cmd) {
				if (!name || !cmd) {
					return false;
				}

				// merge any existing command properties
				cmd = $.extend(SCEditor.commands[name] || {}, cmd);

				cmd.remove = function () {
					SCEditor.command.remove(name);
				};

				SCEditor.commands[name] = cmd;
				return this;
			},

			/**
			 * Removes a command
			 *
			 * @param {String} name
			 * @return {this}
			 * @since v1.3.5
			 */
			remove: function (name) {
				if (SCEditor.commands[name]) {
					delete SCEditor.commands[name];
				}

				return this;
			}
		};

		return SCEditor;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
		'use strict';

		var plugins = {};

		/**
		 * Plugin Manager class
		 * @class PluginManager
		 * @name PluginManager
		 */
		var PluginManager = function (thisObj) {
			/**
			 * Alias of this
			 *
			 * @private
			 * @type {Object}
			 */
			var base = this;

			/**
			 * Array of all currently registered plugins
			 *
			 * @type {Array}
			 * @private
			 */
			var registeredPlugins = [];


			/**
			 * Changes a signals name from "name" into "signalName".
			 *
			 * @param  {String} signal
			 * @return {String}
			 * @private
			 */
			var formatSignalName = function (signal) {
				return 'signal' + signal.charAt(0).toUpperCase() + signal.slice(1);
			};

			/**
			 * Calls handlers for a signal
			 *
			 * @see call()
			 * @see callOnlyFirst()
			 * @param  {Array}   args
			 * @param  {Boolean} returnAtFirst
			 * @return {Mixed}
			 * @private
			 */
			var callHandlers = function (args, returnAtFirst) {
				args = [].slice.call(args);

				var	idx, ret,
					signal = formatSignalName(args.shift());

				for (idx = 0; idx < registeredPlugins.length; idx++) {
					if (signal in registeredPlugins[idx]) {
						ret = registeredPlugins[idx][signal].apply(thisObj, args);

						if (returnAtFirst) {
							return ret;
						}
					}
				}
			};

			/**
			 * Calls all handlers for the passed signal
			 *
			 * @param  {String}    signal
			 * @param  {...String} args
			 * @return {Void}
			 * @function
			 * @name call
			 * @memberOf PluginManager.prototype
			 */
			base.call = function () {
				callHandlers(arguments, false);
			};

			/**
			 * Calls the first handler for a signal, and returns the
			 *
			 * @param  {String}    signal
			 * @param  {...String} args
			 * @return {Mixed} The result of calling the handler
			 * @function
			 * @name callOnlyFirst
			 * @memberOf PluginManager.prototype
			 */
			base.callOnlyFirst = function () {
				return callHandlers(arguments, true);
			};

			/**
			 * Checks if a signal has a handler
			 *
			 * @param  {String} signal
			 * @return {Boolean}
			 * @function
			 * @name hasHandler
			 * @memberOf PluginManager.prototype
			 */
			base.hasHandler = function (signal) {
				var i  = registeredPlugins.length;
				signal = formatSignalName(signal);

				while (i--) {
					if (signal in registeredPlugins[i]) {
						return true;
					}
				}

				return false;
			};

			/**
			 * Checks if the plugin exists in plugins
			 *
			 * @param  {String} plugin
			 * @return {Boolean}
			 * @function
			 * @name exists
			 * @memberOf PluginManager.prototype
			 */
			base.exists = function (plugin) {
				if (plugin in plugins) {
					plugin = plugins[plugin];

					return typeof plugin === 'function' &&
						typeof plugin.prototype === 'object';
				}

				return false;
			};

			/**
			 * Checks if the passed plugin is currently registered.
			 *
			 * @param  {String} plugin
			 * @return {Boolean}
			 * @function
			 * @name isRegistered
			 * @memberOf PluginManager.prototype
			 */
			base.isRegistered = function (plugin) {
				if (base.exists(plugin)) {
					var idx = registeredPlugins.length;

					while (idx--) {
						if (registeredPlugins[idx] instanceof plugins[plugin]) {
							return true;
						}
					}
				}

				return false;
			};

			/**
			 * Registers a plugin to receive signals
			 *
			 * @param  {String} plugin
			 * @return {Boolean}
			 * @function
			 * @name register
			 * @memberOf PluginManager.prototype
			 */
			base.register = function (plugin) {
				if (!base.exists(plugin) || base.isRegistered(plugin)) {
					return false;
				}

				plugin = new plugins[plugin]();
				registeredPlugins.push(plugin);

				if ('init' in plugin) {
					plugin.init.call(thisObj);
				}

				return true;
			};

			/**
			 * Deregisters a plugin.
			 *
			 * @param  {String} plugin
			 * @return {Boolean}
			 * @function
			 * @name deregister
			 * @memberOf PluginManager.prototype
			 */
			base.deregister = function (plugin) {
				var	removedPlugin,
					pluginIdx = registeredPlugins.length,
					removed   = false;

				if (!base.isRegistered(plugin)) {
					return removed;
				}

				while (pluginIdx--) {
					if (registeredPlugins[pluginIdx] instanceof plugins[plugin]) {
						removedPlugin = registeredPlugins.splice(pluginIdx, 1)[0];
						removed       = true;

						if ('destroy' in removedPlugin) {
							removedPlugin.destroy.call(thisObj);
						}
					}
				}

				return removed;
			};

			/**
			 * Clears all plugins and removes the owner reference.
			 *
			 * Calling any functions on this object after calling
			 * destroy will cause a JS error.
			 *
			 * @name destroy
			 * @memberOf PluginManager.prototype
			 */
			base.destroy = function () {
				var i = registeredPlugins.length;

				while (i--) {
					if ('destroy' in registeredPlugins[i]) {
						registeredPlugins[i].destroy.call(thisObj);
					}
				}

				registeredPlugins = [];
				thisObj    = null;
			};
		};

		PluginManager.plugins = plugins;

		return PluginManager;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $       = __webpack_require__(1);
		var dom     = __webpack_require__(5);
		var escape  = __webpack_require__(6);
		var browser = __webpack_require__(7);

		var IE_VER = browser.ie;

		// In IE < 11 a BR at the end of a block level element
		// causes a line break. In all other browsers it's collapsed.
		var IE_BR_FIX = IE_VER && IE_VER < 11;


		/**
		 * Gets the text, start/end node and offset for
		 * length chars left or right of the passed node
		 * at the specified offset.
		 *
		 * @param  {Node}  node
		 * @param  {Number}  offset
		 * @param  {Boolean} isLeft
		 * @param  {Number}  length
		 * @return {Object}
		 * @private
		 */
		var outerText = function (range, isLeft, length) {
			var nodeValue, remaining, start, end, node,
				text = '',
				next = range.startContainer,
				offset = range.startOffset;

			// Handle cases where node is a paragraph and offset
			// refers to the index of a text node.
			// 3 = text node
			if (next && next.nodeType !== 3) {
				next = next.childNodes[offset];
				offset = 0;
			}

			start = end = offset;

			while (length > text.length && next && next.nodeType === 3) {
				nodeValue = next.nodeValue;
				remaining = length - text.length;

				// If not the first node, start and end should be at their
				// max values as will be updated when getting the text
				if (node) {
					end = nodeValue.length;
					start = 0;
				}

				node = next;

				if (isLeft) {
					start = Math.max(end - remaining, 0);
					offset = start;

					text = nodeValue.substr(start, end - start) + text;
					next = node.previousSibling;
				} else {
					end = Math.min(remaining, nodeValue.length);
					offset = start + end;

					text += nodeValue.substr(start, end);
					next = node.nextSibling;
				}
			}

			return {
				node: node || next,
				offset: offset,
				text: text
			};
		};

		var RangeHelper = function (win, d) {
			var	_createMarker, _prepareInput,
				doc          = d || win.contentDocument || win.document,
				startMarker  = 'sceditor-start-marker',
				endMarker    = 'sceditor-end-marker',
				base         = this;

			/**
			 * <p>Inserts HTML into the current range replacing any selected
			 * text.</p>
			 *
			 * <p>If endHTML is specified the selected contents will be put between
			 * html and endHTML. If there is nothing selected html and endHTML are
			 * just concatenate together.</p>
			 *
			 * @param {string} html
			 * @param {string} endHTML
			 * @return False on fail
			 * @function
			 * @name insertHTML
			 * @memberOf RangeHelper.prototype
			 */
			base.insertHTML = function (html, endHTML) {
				var	node, div,
					range = base.selectedRange();

				if (!range) {
					return false;
				}

				if (endHTML) {
					html += base.selectedHtml() + endHTML;
				}

				div           = doc.createElement('p');
				node          = doc.createDocumentFragment();
				div.innerHTML = html;

				while (div.firstChild) {
					node.appendChild(div.firstChild);
				}

				base.insertNode(node);
			};

			/**
			 * Prepares HTML to be inserted by adding a zero width space
			 * if the last child is empty and adding the range start/end
			 * markers to the last child.
			 *
			 * @param  {Node|string} node
			 * @param  {Node|string} endNode
			 * @param  {boolean} returnHtml
			 * @return {Node|string}
			 * @private
			 */
			_prepareInput = function (node, endNode, returnHtml) {
				var lastChild, $lastChild,
					div  = doc.createElement('div'),
					$div = $(div);

				if (typeof node === 'string') {
					if (endNode) {
						node += base.selectedHtml() + endNode;
					}

					$div.html(node);
				} else {
					$div.append(node);

					if (endNode) {
						$div
							.append(base.selectedRange().extractContents())
							.append(endNode);
					}
				}

				if (!(lastChild = div.lastChild)) {
					return;
				}

				while (!dom.isInline(lastChild.lastChild, true)) {
					lastChild = lastChild.lastChild;
				}

				if (dom.canHaveChildren(lastChild)) {
					$lastChild = $(lastChild);

					// IE <= 8 and Webkit won't allow the cursor to be placed
					// inside an empty tag, so add a zero width space to it.
					if (!lastChild.lastChild) {
						$lastChild.append('\u200B');
					}
				}

				base.removeMarkers();

				// Append marks to last child so when restored cursor will be in
				// the right place
				($lastChild || $div)
					.append(_createMarker(startMarker))
					.append(_createMarker(endMarker));

				if (returnHtml) {
					return $div.html();
				}

				return $(doc.createDocumentFragment()).append($div.contents())[0];
			};

			/**
			 * <p>The same as insertHTML except with DOM nodes instead</p>
			 *
			 * <p><strong>Warning:</strong> the nodes must belong to the
			 * document they are being inserted into. Some browsers
			 * will throw exceptions if they don't.</p>
			 *
			 * @param {Node} node
			 * @param {Node} endNode
			 * @return False on fail
			 * @function
			 * @name insertNode
			 * @memberOf RangeHelper.prototype
			 */
			base.insertNode = function (node, endNode) {
				var	input  = _prepareInput(node, endNode),
					range  = base.selectedRange(),
					parent = range.commonAncestorContainer;

				if (!input) {
					return false;
				}

				range.deleteContents();

				// FF allows <br /> to be selected but inserting a node
				// into <br /> will cause it not to be displayed so must
				// insert before the <br /> in FF.
				// 3 = TextNode
				if (parent && parent.nodeType !== 3 &&
					!dom.canHaveChildren(parent)) {
					parent.parentNode.insertBefore(input, parent);
				} else {
					range.insertNode(input);
				}

				base.restoreRange();
			};

			/**
			 * <p>Clones the selected Range</p>
			 *
			 * <p>IE <= 8 will return a TextRange, all other browsers
			 * will return a Range object.</p>
			 *
			 * @return {Range|TextRange}
			 * @function
			 * @name cloneSelected
			 * @memberOf RangeHelper.prototype
			 */
			base.cloneSelected = function () {
				var range = base.selectedRange();

				if (range) {
					return range.cloneRange();
				}
			};

			/**
			 * <p>Gets the selected Range</p>
			 *
			 * <p>IE <= 8 will return a TextRange, all other browsers
			 * will return a Range object.</p>
			 *
			 * @return {Range|TextRange}
			 * @function
			 * @name selectedRange
			 * @memberOf RangeHelper.prototype
			 */
			base.selectedRange = function () {
				var	range, firstChild,
					sel = win.getSelection();

				if (!sel) {
					return;
				}

				// When creating a new range, set the start to the first child
				// element of the body element to avoid errors in FF.
				if (sel.getRangeAt && sel.rangeCount <= 0) {
					firstChild = doc.body;
					while (firstChild.firstChild) {
						firstChild = firstChild.firstChild;
					}

					range = doc.createRange();
					// Must be setStartBefore otherwise it can cause infinite
					// loops with lists in WebKit. See issue 442
					range.setStartBefore(firstChild);

					sel.addRange(range);
				}

				if (sel.rangeCount > 0) {
					range = sel.getRangeAt(0);
				}

				return range;
			};

			/**
			 * Gets if there is currently a selection
			 *
			 * @return {boolean}
			 * @function
			 * @name hasSelection
			 * @since 1.4.4
			 * @memberOf RangeHelper.prototype
			 */
			base.hasSelection = function () {
				var	sel = win.getSelection();

				return sel && sel.rangeCount > 0;
			};

			/**
			 * Gets the currently selected HTML
			 *
			 * @return {string}
			 * @function
			 * @name selectedHtml
			 * @memberOf RangeHelper.prototype
			 */
			base.selectedHtml = function () {
				var	div,
					range = base.selectedRange();

				if (range) {
					div = doc.createElement('p');
					div.appendChild(range.cloneContents());

					return div.innerHTML;
				}

				return '';
			};

			/**
			 * Gets the parent node of the selected contents in the range
			 *
			 * @return {HTMLElement}
			 * @function
			 * @name parentNode
			 * @memberOf RangeHelper.prototype
			 */
			base.parentNode = function () {
				var range = base.selectedRange();

				if (range) {
					return range.parentElement ?
						range.parentElement() :
						range.commonAncestorContainer;
				}
			};

			/**
			 * Gets the first block level parent of the selected
			 * contents of the range.
			 *
			 * @return {HTMLElement}
			 * @function
			 * @name getFirstBlockParent
			 * @memberOf RangeHelper.prototype
			 */
			/**
			 * Gets the first block level parent of the selected
			 * contents of the range.
			 *
			 * @param {Node} n The element to get the first block level parent from
			 * @return {HTMLElement}
			 * @function
			 * @name getFirstBlockParent^2
			 * @since 1.4.1
			 * @memberOf RangeHelper.prototype
			 */
			base.getFirstBlockParent = function (n) {
				var func = function (node) {
					if (!dom.isInline(node, true)) {
						return node;
					}

					node = node ? node.parentNode : null;

					return node ? func(node) : node;
				};

				return func(n || base.parentNode());
			};

			/**
			 * Inserts a node at either the start or end of the current selection
			 *
			 * @param {Bool} start
			 * @param {Node} node
			 * @function
			 * @name insertNodeAt
			 * @memberOf RangeHelper.prototype
			 */
			base.insertNodeAt = function (start, node) {
				var	currentRange = base.selectedRange(),
					range        = base.cloneSelected();

				if (!range) {
					return false;
				}

				range.collapse(start);
				range.insertNode(node);

				// Reselect the current range.
				// Fixes issue with Chrome losing the selection. Issue#82
				base.selectRange(currentRange);
			};

			/**
			 * Creates a marker node
			 *
			 * @param {string} id
			 * @return {Node}
			 * @private
			 */
			_createMarker = function (id) {
				base.removeMarker(id);

				var marker              = doc.createElement('span');
				marker.id               = id;
				marker.style.lineHeight = '0';
				marker.style.display    = 'none';
				marker.className        = 'sceditor-selection sceditor-ignore';
				marker.innerHTML        = ' ';

				return marker;
			};

			/**
			 * Inserts start/end markers for the current selection
			 * which can be used by restoreRange to re-select the
			 * range.
			 *
			 * @memberOf RangeHelper.prototype
			 * @function
			 * @name insertMarkers
			 */
			base.insertMarkers = function () {
				var	currentRange = base.selectedRange();

				base.insertNodeAt(true, _createMarker(startMarker));

				// Fixes issue with end marker sometimes being placed before
				// the start marker when the range is collapsed.
				if (currentRange && currentRange.collapsed) {
					$(base.getMarker(startMarker)).after(_createMarker(endMarker));
				} else {
					base.insertNodeAt(false, _createMarker(endMarker));
				}
			};

			/**
			 * Gets the marker with the specified ID
			 *
			 * @param {string} id
			 * @return {Node}
			 * @function
			 * @name getMarker
			 * @memberOf RangeHelper.prototype
			 */
			base.getMarker = function (id) {
				return doc.getElementById(id);
			};

			/**
			 * Removes the marker with the specified ID
			 *
			 * @param {string} id
			 * @function
			 * @name removeMarker
			 * @memberOf RangeHelper.prototype
			 */
			base.removeMarker = function (id) {
				var marker = base.getMarker(id);

				if (marker) {
					marker.parentNode.removeChild(marker);
				}
			};

			/**
			 * Removes the start/end markers
			 *
			 * @function
			 * @name removeMarkers
			 * @memberOf RangeHelper.prototype
			 */
			base.removeMarkers = function () {
				base.removeMarker(startMarker);
				base.removeMarker(endMarker);
			};

			/**
			 * Saves the current range location. Alias of insertMarkers()
			 *
			 * @function
			 * @name saveRage
			 * @memberOf RangeHelper.prototype
			 */
			base.saveRange = function () {
				base.insertMarkers();
			};

			/**
			 * Select the specified range
			 *
			 * @param {Range|TextRange} range
			 * @function
			 * @name selectRange
			 * @memberOf RangeHelper.prototype
			 */
			base.selectRange = function (range) {
				var lastChild;
				var sel = win.getSelection();
				var container = range.endContainer;

				// Check if cursor is set after a BR when the BR is the only
				// child of the parent. In Firefox this causes a line break
				// to occur when something is typed. See issue #321
				if (!IE_BR_FIX && range.collapsed && container &&
					!dom.isInline(container, true)) {

					lastChild = container.lastChild;
					while (lastChild && $(lastChild).is('.sceditor-ignore')) {
						lastChild = lastChild.previousSibling;
					}

					if ($(lastChild).is('br')) {
						var rng = doc.createRange();
						rng.setEndAfter(lastChild);
						rng.collapse(false);

						if (base.compare(range, rng)) {
							range.setStartBefore(lastChild);
							range.collapse(true);
						}
					}
				}

				if (sel) {
					base.clear();
					sel.addRange(range);
				}
			};

			/**
			 * Restores the last range saved by saveRange() or insertMarkers()
			 *
			 * @function
			 * @name restoreRange
			 * @memberOf RangeHelper.prototype
			 */
			base.restoreRange = function () {
				var	isCollapsed,
					range = base.selectedRange(),
					start = base.getMarker(startMarker),
					end   = base.getMarker(endMarker);

				if (!start || !end || !range) {
					return false;
				}

				isCollapsed = start.nextSibling === end;

				range = doc.createRange();
				range.setStartBefore(start);
				range.setEndAfter(end);

				if (isCollapsed) {
					range.collapse(true);
				}

				base.selectRange(range);
				base.removeMarkers();
			};

			/**
			 * Selects the text left and right of the current selection
			 *
			 * @param {int} left
			 * @param {int} right
			 * @since 1.4.3
			 * @function
			 * @name selectOuterText
			 * @memberOf RangeHelper.prototype
			 */
			base.selectOuterText = function (left, right) {
				var start, end,
					range = base.cloneSelected();

				if (!range) {
					return false;
				}

				range.collapse(false);

				start = outerText(range, true, left);
				end = outerText(range, false, right);

				range.setStart(start.node, start.offset);
				range.setEnd(end.node, end.offset);

				base.selectRange(range);
			};

			/**
			 * Gets the text left or right of the current selection
			 *
			 * @param {boolean} before
			 * @param {number} length
			 * @since 1.4.3
			 * @function
			 * @name selectOuterText
			 * @memberOf RangeHelper.prototype
			 */
			base.getOuterText = function (before, length) {
				var	range = base.cloneSelected();

				if (!range) {
					return '';
				}

				range.collapse(!before);

				return outerText(range, before, length).text;
			};

			/**
			 * Replaces keywords with values based on the current caret position
			 *
			 * @param {Array}   keywords
			 * @param {boolean} includeAfter      If to include the text after the
			 *                                    current caret position or just
			 *                                    text before
			 * @param {boolean} keywordsSorted    If the keywords array is pre
			 *                                    sorted shortest to longest
			 * @param {number}  longestKeyword    Length of the longest keyword
			 * @param {boolean} requireWhitespace If the key must be surrounded
			 *                                    by whitespace
			 * @param {string}  keypressChar      If this is being called from
			 *                                    a keypress event, this should be
			 *                                    set to the pressed character
			 * @return {boolean}
			 * @function
			 * @name replaceKeyword
			 * @memberOf RangeHelper.prototype
			 */
			// eslint-disable-next-line max-params
			base.replaceKeyword = function (
				keywords,
				includeAfter,
				keywordsSorted,
				longestKeyword,
				requireWhitespace,
				keypressChar
			) {
				if (!keywordsSorted) {
					keywords.sort(function (a, b) {
						return a[0].length - b[0].length;
					});
				}

				var outerText, match, matchPos, startIndex,
					leftLen, charsLeft, keyword, keywordLen,
					whitespaceRegex = '(^|[\\s\xA0\u2002\u2003\u2009])',
					keywordIdx      = keywords.length,
					whitespaceLen   = requireWhitespace ? 1 : 0,
					maxKeyLen       = longestKeyword ||
						keywords[keywordIdx - 1][0].length;

				if (requireWhitespace) {
					maxKeyLen++;
				}

				keypressChar = keypressChar || '';
				outerText    = base.getOuterText(true, maxKeyLen);
				leftLen      = outerText.length;
				outerText   += keypressChar;

				if (includeAfter) {
					outerText += base.getOuterText(false, maxKeyLen);
				}

				while (keywordIdx--) {
					keyword    = keywords[keywordIdx][0];
					keywordLen = keyword.length;
					startIndex = Math.max(0, leftLen - keywordLen - whitespaceLen);
					matchPos   = -1;

					if (requireWhitespace) {
						match = outerText
							.substr(startIndex)
							.match(new RegExp(whitespaceRegex +
								escape.regex(keyword) + whitespaceRegex));

						if (match) {
							// Add the length of the text that was removed by
							// substr() and also add 1 for the whitespace
							matchPos = match.index + startIndex + match[1].length;
						}
					} else {
						matchPos = outerText.indexOf(keyword, startIndex);
					}

					if (matchPos > -1) {
						// Make sure the match is between before and
						// after, not just entirely in one side or the other
						if (matchPos <= leftLen &&
							matchPos + keywordLen + whitespaceLen >= leftLen) {
							charsLeft = leftLen - matchPos;

							// If the keypress char is white space then it should
							// not be replaced, only chars that are part of the
							// key should be replaced.
							base.selectOuterText(
								charsLeft,
								keywordLen - charsLeft -
									(/^\S/.test(keypressChar) ? 1 : 0)
							);

							base.insertHTML(keywords[keywordIdx][1]);
							return true;
						}
					}
				}

				return false;
			};

			/**
			 * Compares two ranges.
			 *
			 * If rangeB is undefined it will be set to
			 * the current selected range
			 *
			 * @param  {Range} rngA
			 * @param  {Range} [rngB]
			 * @return {boolean}
			 */
			base.compare = function (rngA, rngB) {
				if (!rngB) {
					rngB = base.selectedRange();
				}

				if (!rngA || !rngB) {
					return !rngA && !rngB;
				}

				return rngA.compareBoundaryPoints(Range.END_TO_END, rngB) === 0 &&
					rngA.compareBoundaryPoints(Range.START_TO_START, rngB) === 0;
			};

			/**
			 * Removes any current selection
			 *
			 * @since 1.4.6
			 */
			base.clear = function () {
				var sel = win.getSelection();

				if (sel) {
					if (sel.removeAllRanges) {
						sel.removeAllRanges();
					} else if (sel.empty) {
						sel.empty();
					}
				}
			};
		};

		return RangeHelper;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $ = __webpack_require__(1);

		var _propertyNameCache = {};

		var dom = {
			/**
			 * Loop all child nodes of the passed node
			 *
			 * The function should accept 1 parameter being the node.
			 * If the function returns false the loop will be exited.
			 *
			 * @param  {HTMLElement} node
			 * @param  {Function} func       Callback which is called with every
			 *                               child node as the first argument.
			 * @param  {bool} innermostFirst If the innermost node should be passed
			 *                               to the function before it's parents.
			 * @param  {bool} siblingsOnly   If to only traverse the nodes siblings
			 * @param  {bool} reverse        If to traverse the nodes in reverse
			 */
			// eslint-disable-next-line max-params
			traverse: function (node, func, innermostFirst, siblingsOnly, reverse) {
				if (node) {
					node = reverse ? node.lastChild : node.firstChild;

					while (node) {
						var next = reverse ?
							node.previousSibling :
							node.nextSibling;

						if (
							(!innermostFirst && func(node) === false) ||
							(!siblingsOnly && dom.traverse(
								node, func, innermostFirst, siblingsOnly, reverse
							) === false) ||
							(innermostFirst && func(node) === false)
						) {
							return false;
						}

						// move to next child
						node = next;
					}
				}
			},

			/**
			 * Like traverse but loops in reverse
			 * @see traverse
			 */
			rTraverse: function (node, func, innermostFirst, siblingsOnly) {
				this.traverse(node, func, innermostFirst, siblingsOnly, true);
			},

			/**
			 * Parses HTML
			 *
			 * @param {String} html
			 * @param {Document} context
			 * @since 1.4.4
			 * @return {Array}
			 */
			parseHTML: function (html, context) {
				var	ret = [],
					tmp = (context || document).createElement('div');

				tmp.innerHTML = html;

				$.merge(ret, tmp.childNodes);

				return ret;
			},

			/**
			 * Checks if an element has any styling.
			 *
			 * It has styling if it is not a plain <div> or <p> or
			 * if it has a class, style attribute or data.
			 *
			 * @param  {HTMLElement} elm
			 * @return {Boolean}
			 * @since 1.4.4
			 */
			hasStyling: function (elm) {
				var $elm = $(elm);

				return elm && (!$elm.is('p,div') || elm.className ||
					$elm.attr('style') || !$.isEmptyObject($elm.data()));
			},

			/**
			 * Converts an element from one type to another.
			 *
			 * For example it can convert the element <b> to <strong>
			 *
			 * @param  {HTMLElement} oldElm
			 * @param  {String}      toTagName
			 * @return {HTMLElement}
			 * @since 1.4.4
			 */
			convertElement: function (oldElm, toTagName) {
				var	child, attr,
					oldAttrs = oldElm.attributes,
					attrsIdx = oldAttrs.length,
					newElm   = oldElm.ownerDocument.createElement(toTagName);

				while (attrsIdx--) {
					attr = oldAttrs[attrsIdx];

					// Some browsers parse invalid attributes names like
					// 'size"2' which throw an exception when set, just
					// ignore these.
					try {
						newElm.setAttribute(attr.name, attr.value);
					} catch (ex) {}
				}

				while ((child = oldElm.firstChild)) {
					newElm.appendChild(child);
				}

				oldElm.parentNode.replaceChild(newElm, oldElm);

				return newElm;
			},

			/**
			 * List of block level elements separated by bars (|)
			 * @type {string}
			 */
			blockLevelList: '|body|hr|p|div|h1|h2|h3|h4|h5|h6|address|pre|form|' +
				'table|tbody|thead|tfoot|th|tr|td|li|ol|ul|blockquote|center|',

			/**
			 * List of elements that do not allow children separated by bars (|)
			 *
			 * @param {Node} node
			 * @return {bool}
			 * @since  1.4.5
			 */
			canHaveChildren: function (node) {
				// 1  = Element
				// 9  = Document
				// 11 = Document Fragment
				if (!/11?|9/.test(node.nodeType)) {
					return false;
				}

				// List of empty HTML tags separated by bar (|) character.
				// Source: http://www.w3.org/TR/html4/index/elements.html
				// Source: http://www.w3.org/TR/html5/syntax.html#void-elements
				return ('|iframe|area|base|basefont|br|col|frame|hr|img|input|wbr' +
					'|isindex|link|meta|param|command|embed|keygen|source|track|' +
					'object|').indexOf('|' + node.nodeName.toLowerCase() + '|') < 0;
			},

			/**
			 * Checks if an element is inline
			 *
			 * @return {bool}
			 */
			isInline: function (elm, includeCodeAsBlock) {
				var tagName,
					nodeType = (elm || {}).nodeType || 3;

				if (nodeType !== 1) {
					return nodeType === 3;
				}

				tagName = elm.tagName.toLowerCase();

				if (tagName === 'code') {
					return !includeCodeAsBlock;
				}

				return dom.blockLevelList.indexOf('|' + tagName + '|') < 0;
			},

			/**
			 * <p>Copys the CSS from 1 node to another.</p>
			 *
			 * <p>Only copies CSS defined on the element e.g. style attr.</p>
			 *
			 * @param {HTMLElement} from
			 * @param {HTMLElement} to
			 */
			copyCSS: function (from, to) {
				to.style.cssText = from.style.cssText + to.style.cssText;
			},

			/**
			 * Fixes block level elements inside in inline elements.
			 *
			 * Also fixes invalid list nesting by placing nested lists
			 * inside the previous li tag or wrapping them in an li tag.
			 *
			 * @param {HTMLElement} node
			 */
			fixNesting: function (node) {
				var	getLastInlineParent = function (node) {
					while (dom.isInline(node.parentNode, true)) {
						node = node.parentNode;
					}

					return node;
				};

				dom.traverse(node, function (node) {
					var list = 'ul,ol',
						isBlock = !dom.isInline(node, true),
						$node = $(node);

					// Any blocklevel element inside an inline element needs fixing.
					if (isBlock && dom.isInline(node.parentNode, true)) {
						var	parent  = getLastInlineParent(node),
							rParent = parent.parentNode,
							before  = dom.extractContents(parent, node),
							middle  = node;

						// copy current styling so when moved out of the parent
						// it still has the same styling
						dom.copyCSS(parent, middle);

						rParent.insertBefore(before, parent);
						rParent.insertBefore(middle, parent);
					}

					// Fix invalid nested lists which should be wrapped in an li tag
					if (isBlock && $node.is(list) && $node.parent().is(list)) {
						var $li = $node.prev('li');

						if ($li.length) {
							$li.append($node);
						} else {
							$node.wrap('<li />');
						}
					}
				});
			},

			/**
			 * Finds the common parent of two nodes
			 *
			 * @param {HTMLElement} node1
			 * @param {HTMLElement} node2
			 * @return {HTMLElement}
			 */
			findCommonAncestor: function (node1, node2) {
				// Not as fast as making two arrays of parents and comparing
				// but is a lot smaller and as it's currently only used with
				// fixing invalid nesting it doesn't need to be very fast
				return $(node1).parents().has($(node2)).first();
			},

			getSibling: function (node, previous) {
				if (!node) {
					return null;
				}

				return (previous ? node.previousSibling : node.nextSibling) ||
					dom.getSibling(node.parentNode, previous);
			},

			/**
			 * Removes unused whitespace from the root and all it's children
			 *
			 * @name removeWhiteSpace^1
			 * @param {HTMLElement} root
			 */
			/**
			 * Removes unused whitespace from the root and all it's children.
			 *
			 * If preserveNewLines is true, new line characters will not be removed
			 *
			 * @name removeWhiteSpace^2
			 * @param {HTMLElement} root
			 * @param {boolean}     preserveNewLines
			 * @since 1.4.3
			 */
			removeWhiteSpace: function (root, preserveNewLines) {
				var	nodeValue, nodeType, next, previous, previousSibling,
					cssWhiteSpace, nextNode, trimStart,
					getSibling        = dom.getSibling,
					isInline          = dom.isInline,
					node              = root.firstChild;

				while (node) {
					nextNode  = node.nextSibling;
					nodeValue = node.nodeValue;
					nodeType  = node.nodeType;

					// 1 = element
					if (nodeType === 1 && node.firstChild) {
						cssWhiteSpace = $(node).css('whiteSpace');

						// Skip all pre & pre-wrap with any vendor prefix
						if (!/pre(\-wrap)?$/i.test(cssWhiteSpace)) {
							dom.removeWhiteSpace(
								node,
								/line$/i.test(cssWhiteSpace)
							);
						}
					}

					// 3 = textnode
					if (nodeType === 3) {
						next            = getSibling(node);
						previous        = getSibling(node, true);
						trimStart       = false;

						while ($(previous).hasClass('sceditor-ignore')) {
							previous = getSibling(previous, true);
						}
						// If previous sibling isn't inline or is a textnode that
						// ends in whitespace, time the start whitespace
						if (isInline(node) && previous) {
							previousSibling = previous;

							while (previousSibling.lastChild) {
								previousSibling = previousSibling.lastChild;
							}

							trimStart = previousSibling.nodeType === 3 ?
								/[\t\n\r ]$/.test(previousSibling.nodeValue) :
								!isInline(previousSibling);
						}

						// Clear zero width spaces
						nodeValue = nodeValue.replace(/\u200B/g, '');

						// Strip leading whitespace
						if (!previous || !isInline(previous) || trimStart) {
							nodeValue = nodeValue.replace(
								preserveNewLines ? /^[\t ]+/ : /^[\t\n\r ]+/,
								''
							);
						}

						// Strip trailing whitespace
						if (!next || !isInline(next)) {
							nodeValue = nodeValue.replace(
								preserveNewLines ? /[\t ]+$/ : /[\t\n\r ]+$/,
								''
							);
						}

						// Remove empty text nodes
						if (!nodeValue.length) {
							root.removeChild(node);
						} else {
							node.nodeValue = nodeValue.replace(
								preserveNewLines ? /[\t ]+/g : /[\t\n\r ]+/g,
								' '
							);
						}
					}

					node = nextNode;
				}
			},

			/**
			 * Extracts all the nodes between the start and end nodes
			 *
			 * @param {HTMLElement} startNode	The node to start extracting at
			 * @param {HTMLElement} endNode		The node to stop extracting at
			 * @return {DocumentFragment}
			 */
			extractContents: function (startNode, endNode) {
				var	extract,
					commonAncestor = dom
						.findCommonAncestor(startNode, endNode)
						.get(0),
					startReached   = false,
					endReached     = false;

				extract = function (root) {
					var clone,
						docFrag = startNode.ownerDocument.createDocumentFragment();

					dom.traverse(root, function (node) {
						// if end has been reached exit loop
						if (endReached || node === endNode) {
							endReached = true;

							return false;
						}

						if (node === startNode) {
							startReached = true;
						}

						// if the start has been reached and this elm contains
						// the end node then clone it
						// if this node contains the start node then add it
						if ($.contains(node, startNode) ||
							(startReached && $.contains(node, endNode))) {
							clone = node.cloneNode(false);

							clone.appendChild(extract(node));
							docFrag.appendChild(clone);

						// otherwise move it if its parent isn't already part of it
						} else if (startReached && !$.contains(docFrag, node)) {
							docFrag.appendChild(node);
						}
					}, false);

					return docFrag;
				};

				return extract(commonAncestor);
			},

			/**
			 * Gets the offset position of an element
			 *
			 * @param  {HTMLElement} obj
			 * @return {Object} An object with left and top properties
			 */
			getOffset: function (obj) {
				var	pLeft = 0,
					pTop = 0;

				while (obj) {
					pLeft += obj.offsetLeft;
					pTop  += obj.offsetTop;
					obj   = obj.offsetParent;
				}

				return {
					left: pLeft,
					top: pTop
				};
			},

			/**
			 * Gets the value of a CSS property from the elements style attribute
			 *
			 * @param  {HTMLElement} elm
			 * @param  {String} property
			 * @return {String}
			 */
			getStyle: function (elm, property) {
				var	$elm, direction, styleValue,
					elmStyle = elm.style;

				if (!elmStyle) {
					return '';
				}

				if (!_propertyNameCache[property]) {
					_propertyNameCache[property] = $.camelCase(property);
				}

				property   = _propertyNameCache[property];
				styleValue = elmStyle[property];

				// Add an exception for text-align
				if ('textAlign' === property) {
					$elm       = $(elm);
					direction  = elmStyle.direction;
					styleValue = styleValue || $elm.css(property);

					if ($elm.parent().css(property) === styleValue ||
						$elm.css('display') !== 'block' ||
						$elm.is('hr') || $elm.is('th')) {
						return '';
					}
	// check all works with changes and merge with prev?
					// IE changes text-align to the same as the current direction
					// so skip unless its not the same
					if ((/right/i.test(styleValue) && direction === 'rtl') ||
						(/left/i.test(styleValue) && direction === 'ltr')) {
						return '';
					}
				}

				return styleValue;
			},

			/**
			 * Tests if an element has a style.
			 *
			 * If values are specified it will check that the styles value
			 * matches one of the values
			 *
			 * @param  {HTMLElement} elm
			 * @param  {String} property
			 * @param  {String|Array} values
			 * @return {Boolean}
			 */
			hasStyle: function (elm, property, values) {
				var styleValue = dom.getStyle(elm, property);

				if (!styleValue) {
					return false;
				}

				return !values || styleValue === values ||
					($.isArray(values) && $.inArray(styleValue, values) > -1);
			}
		};

		return dom;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
		'use strict';

		// Must start with a valid scheme
		// 		^
		// Schemes that are considered safe
		// 		(https?|s?ftp|mailto|spotify|skype|ssh|teamspeak|tel):|
		// Relative schemes (//:) are considered safe
		// 		(\\/\\/)|
		// Image data URI's are considered safe
		// 		data:image\\/(png|bmp|gif|p?jpe?g);
		var VALID_SCHEME_REGEX =
			/^(https?|s?ftp|mailto|spotify|skype|ssh|teamspeak|tel):|(\/\/)|data:image\/(png|bmp|gif|p?jpe?g);/i;

		/**
		 * Escapes a string so it's safe to use in regex
		 *
		 * @param {String} str
		 * @return {String}
		 * @name regex
		 */
		exports.regex = function (str) {
			return str.replace(/([\-.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
		};

		/**
		 * Escapes all HTML entities in a string
		 *
		 * If noQuotes is set to false, all single and double
		 * quotes will also be escaped
		 *
		 * @param {String} str
		 * @param {Boolean} [noQuotes=false]
		 * @return {String}
		 * @name entities
		 * @since 1.4.1
		 */
		exports.entities = function (str, noQuotes) {
			if (!str) {
				return str;
			}

			var replacements = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'  ': '&nbsp; ',
				'\r\n': '<br />',
				'\r': '<br />',
				'\n': '<br />'
			};

			if (noQuotes !== false) {
				replacements['"']  = '&#34;';
				replacements['\''] = '&#39;';
				replacements['`']  = '&#96;';
			}

			str = str.replace(/ {2}|\r\n|[&<>\r\n'"`]/g, function (match) {
				return replacements[match] || match;
			});

			return str;
		};

		/**
		 * Escape URI scheme.
		 *
		 * Appends the current URL to a url if it has a scheme that is not:
		 *
		 * http
		 * https
		 * sftp
		 * ftp
		 * mailto
		 * spotify
		 * skype
		 * ssh
		 * teamspeak
		 * tel
		 * //
		 * data:image/(png|jpeg|jpg|pjpeg|bmp|gif);
		 *
		 * **IMPORTANT**: This does not escape any HTML in a url, for
		 * that use the escape.entities() method.
		 *
		 * @param  {String} url
		 * @return {String}
		 * @name escapeUriScheme
		 * @memberOf jQuery.sceditor
		 * @since 1.4.5
		 */
		exports.uriScheme = function (url) {
			var	path,
				// If there is a : before a / then it has a scheme
				hasScheme = /^[^\/]*:/i,
				location = window.location;

			// Has no scheme or a valid scheme
			if ((!url || !hasScheme.test(url)) || VALID_SCHEME_REGEX.test(url)) {
				return url;
			}

			path = location.pathname.split('/');
			path.pop();

			return location.protocol + '//' +
				location.host +
				path.join('/') + '/' +
				url;
		};
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
		'use strict';

		var $ = __webpack_require__(1);

		var USER_AGENT = navigator.userAgent;

		/**
		 * Detects the version of IE is being used if any.
		 *
		 * Will be the IE version number or undefined if the
		 * browser is not IE.
		 *
		 * Source: https://gist.github.com/527683 with extra code
		 * for IE 10 & 11 detection.
		 *
		 * @function
		 * @name ie
		 * @type {int}
		 */
		exports.ie = (function () {
			var	undef,
				v   = 3,
				doc = document,
				div = doc.createElement('div'),
				all = div.getElementsByTagName('i');

			do {
				div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
			} while (all[0]);

			// Detect IE 10 as it doesn't support conditional comments.
			if ((doc.documentMode && doc.all && window.atob)) {
				v = 10;
			}

			// Detect IE 11
			if (v === 4 && doc.documentMode) {
				v = 11;
			}

			return v > 4 ? v : undef;
		}());

		exports.edge = '-ms-ime-align' in document.documentElement.style;

		/**
		 * <p>Detects if the browser is iOS</p>
		 *
		 * <p>Needed to fix iOS specific bugs/</p>
		 *
		 * @function
		 * @name ios
		 * @memberOf jQuery.sceditor
		 * @type {Boolean}
		 */
		exports.ios = /iPhone|iPod|iPad| wosbrowser\//i.test(USER_AGENT);

		/**
		 * If the browser supports WYSIWYG editing (e.g. older mobile browsers).
		 *
		 * @function
		 * @name isWysiwygSupported
		 * @return {Boolean}
		 */
		exports.isWysiwygSupported = (function () {
			var	match, isUnsupported, undef,
				editableAttr = $('<p contenteditable="true">')[0].contentEditable;

			// Check if the contenteditable attribute is supported
			if (editableAttr === undef || editableAttr === 'inherit') {
				return false;
			}

			// I think blackberry supports contentEditable or will at least
			// give a valid value for the contentEditable detection above
			// so it isn't included in the below tests.

			// I hate having to do UA sniffing but some mobile browsers say they
			// support contentediable when it isn't usable, i.e. you can't enter
			// text.
			// This is the only way I can think of to detect them which is also how
			// every other editor I've seen deals with this issue.

			// Exclude Opera mobile and mini
			isUnsupported = /Opera Mobi|Opera Mini/i.test(USER_AGENT);

			if (/Android/i.test(USER_AGENT)) {
				isUnsupported = true;

				if (/Safari/.test(USER_AGENT)) {
					// Android browser 534+ supports content editable
					// This also matches Chrome which supports content editable too
					match = /Safari\/(\d+)/.exec(USER_AGENT);
					isUnsupported = (!match || !match[1] ? true : match[1] < 534);
				}
			}

			// The current version of Amazon Silk supports it, older versions didn't
			// As it uses webkit like Android, assume it's the same and started
			// working at versions >= 534
			if (/ Silk\//i.test(USER_AGENT)) {
				match = /AppleWebKit\/(\d+)/.exec(USER_AGENT);
				isUnsupported = (!match || !match[1] ? true : match[1] < 534);
			}

			// iOS 5+ supports content editable
			if (exports.ios) {
				// Block any version <= 4_x(_x)
				isUnsupported = /OS [0-4](_\d)+ like Mac/i.test(USER_AGENT);
			}

			// FireFox does support WYSIWYG on mobiles so override
			// any previous value if using FF
			if (/Firefox/i.test(USER_AGENT)) {
				isUnsupported = false;
			}

			if (/OneBrowser/i.test(USER_AGENT)) {
				isUnsupported = false;
			}

			// UCBrowser works but doesn't give a unique user agent
			if (navigator.vendor === 'UCWEB') {
				isUnsupported = false;
			}

			// IE <= 8 is not supported any more
			if (exports.ie < 9) {
				isUnsupported = true;
			}

			return !isUnsupported;
		}());
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $ = __webpack_require__(1);

		/**
		 * HTML templates used by the editor and default commands
		 * @type {Object}
		 * @private
		 */
		var _templates = {
			html:
				'<!DOCTYPE html>' +
				'<html{attrs}>' +
					'<head>' +
	// TODO: move these styles into the CSS file
						'<style>.ie * {min-height: auto !important} ' +
							'.ie table td {height:15px} ' +
							// Target Edge (fixes edge issues)
							'@supports (-ms-ime-align:auto) { ' +
								'* { min-height: auto !important; } ' +
							'}' +
							'</style>' +
						'<meta http-equiv="Content-Type" ' +
							'content="text/html;charset={charset}" />' +
						'<link rel="stylesheet" type="text/css" href="{style}" />' +
					'</head>' +
					'<body contenteditable="true" {spellcheck}><p></p></body>' +
				'</html>',

			toolbarButton: '<a class="sceditor-button sceditor-button-{name}" ' +
				'data-sceditor-command="{name}" unselectable="on">' +
				'<div unselectable="on">{dispName}</div></a>',

			emoticon: '<img src="{url}" data-sceditor-emoticon="{key}" ' +
				'alt="{key}" title="{tooltip}" />',

			fontOpt: '<a class="sceditor-font-option" href="#" ' +
				'data-font="{font}"><font face="{font}">{font}</font></a>',

			sizeOpt: '<a class="sceditor-fontsize-option" data-size="{size}" ' +
				'href="#"><font size="{size}">{size}</font></a>',

			pastetext:
				'<div><label for="txt">{label}</label> ' +
					'<textarea cols="20" rows="7" id="txt"></textarea></div>' +
					'<div><input type="button" class="button" value="{insert}" />' +
				'</div>',

			table:
				'<div><label for="rows">{rows}</label><input type="text" ' +
					'id="rows" value="2" /></div>' +
				'<div><label for="cols">{cols}</label><input type="text" ' +
					'id="cols" value="2" /></div>' +
				'<div><input type="button" class="button" value="{insert}"' +
					' /></div>',

			image:
				'<div><label for="link">{url}</label> ' +
					'<input type="text" id="image" placeholder="https://" /></div>' +
				'<div><label for="width">{width}</label> ' +
					'<input type="text" id="width" size="2" /></div>' +
				'<div><label for="height">{height}</label> ' +
					'<input type="text" id="height" size="2" /></div>' +
				'<div><input type="button" class="button" value="{insert}" />' +
					'</div>',

			email:
				'<div><label for="email">{label}</label> ' +
					'<input type="text" id="email" /></div>' +
				'<div><label for="des">{desc}</label> ' +
					'<input type="text" id="des" /></div>' +
				'<div><input type="button" class="button" value="{insert}" />' +
					'</div>',

			link:
				'<div><label for="link">{url}</label> ' +
					'<input type="text" id="link" placeholder="https://" /></div>' +
				'<div><label for="des">{desc}</label> ' +
					'<input type="text" id="des" /></div>' +
				'<div><input type="button" class="button" value="{ins}" /></div>',

			youtubeMenu:
				'<div><label for="link">{label}</label> ' +
					'<input type="text" id="link" placeholder="https://" /></div>' +
				'<div><input type="button" class="button" value="{insert}" />' +
					'</div>',

			youtube:
				'<iframe width="560" height="315" frameborder="0" allowfullscreen' +
				'src="https://www.youtube.com/embed/{id}?wmode=opaque&start={time}" ' +
				'data-youtube-id="{id}"></iframe>'
		};

		/**
		 * <p>Replaces any params in a template with the passed params.</p>
		 *
		 * <p>If createHtml is passed it will use jQuery to create the HTML. The
		 * same as doing: $(editor.tmpl("html", {params...}));</p>
		 *
		 * @param {string} name
		 * @param {Object} params
		 * @param {Boolean} createHtml
		 * @private
		 */
		return function (name, params, createHtml) {
			var template = _templates[name];

			$.each(params, function (name, val) {
				template = template.replace(
					new RegExp('\\{' + name + '\\}', 'g'), val
				);
			});

			if (createHtml) {
				template = $(template);
			}

			return template;
		};
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $      = __webpack_require__(1);
		var IE_VER = __webpack_require__(7).ie;
		var _tmpl  = __webpack_require__(8);

		// In IE < 11 a BR at the end of a block level element
		// causes a line break. In all other browsers it's collapsed.
		var IE_BR_FIX = IE_VER && IE_VER < 11;

		/**
		 * Fixes a bug in FF where it sometimes wraps
		 * new lines in their own list item.
		 * See issue #359
		 */
		function fixFirefoxListBug(editor) {
			// Only apply to firefox as will break other browsers.
			if ('mozHidden' in document) {
				var node = editor.getBody()[0];
				var next;

				while (node) {
					next = node;

					if (next.firstChild) {
						next = next.firstChild;
					} else {

						while (next && !next.nextSibling) {
							next = next.parentNode;
						}

						if (next) {
							next = next.nextSibling;
						}
					}

					if (node.nodeType === 3 && /[\n\r\t]+/.test(node.nodeValue)) {
						// Only remove if newlines are collapsed
						if (!/^pre/.test($(node.parentNode).css('white-space'))) {
							$(node).remove();
						}
					}

					node = next;
				}
			}
		}


		/**
		 * Map of all the commands for SCEditor
		 * @type {Object}
		 * @name commands
		 * @memberOf jQuery.sceditor
		 */
		var defaultCommnds = {
			// START_COMMAND: Bold
			bold: {
				exec: 'bold',
				tooltip: 'Bold',
				shortcut: 'Ctrl+B'
			},
			// END_COMMAND
			// START_COMMAND: Italic
			italic: {
				exec: 'italic',
				tooltip: 'Italic',
				shortcut: 'Ctrl+I'
			},
			// END_COMMAND
			// START_COMMAND: Underline
			underline: {
				exec: 'underline',
				tooltip: 'Underline',
				shortcut: 'Ctrl+U'
			},
			// END_COMMAND
			// START_COMMAND: Strikethrough
			strike: {
				exec: 'strikethrough',
				tooltip: 'Strikethrough'
			},
			// END_COMMAND
			// START_COMMAND: Subscript
			subscript: {
				exec: 'subscript',
				tooltip: 'Subscript'
			},
			// END_COMMAND
			// START_COMMAND: Superscript
			superscript: {
				exec: 'superscript',
				tooltip: 'Superscript'
			},
			// END_COMMAND

			// START_COMMAND: Left
			left: {
				exec: 'justifyleft',
				tooltip: 'Align left'
			},
			// END_COMMAND
			// START_COMMAND: Centre
			center: {
				exec: 'justifycenter',
				tooltip: 'Center'
			},
			// END_COMMAND
			// START_COMMAND: Right
			right: {
				exec: 'justifyright',
				tooltip: 'Align right'
			},
			// END_COMMAND
			// START_COMMAND: Justify
			justify: {
				exec: 'justifyfull',
				tooltip: 'Justify'
			},
			// END_COMMAND

			// START_COMMAND: Font
			font: {
				_dropDown: function (editor, caller, callback) {
					var	fontIdx = 0,
						fonts   = editor.opts.fonts.split(','),
						content = $('<div />'),
						/** @private */
						clickFunc = function () {
							callback($(this).data('font'));
							editor.closeDropDown(true);
							return false;
						};

					for (; fontIdx < fonts.length; fontIdx++) {
						content.append(
							_tmpl('fontOpt', {
								font: fonts[fontIdx]
							}, true).click(clickFunc)
						);
					}

					editor.createDropDown(caller, 'font-picker', content);
				},
				exec: function (caller) {
					var editor = this;

					defaultCommnds.font._dropDown(
						editor,
						caller,
						function (fontName) {
							editor.execCommand('fontname', fontName);
						}
					);
				},
				tooltip: 'Font Name'
			},
			// END_COMMAND
			// START_COMMAND: Size
			size: {
				_dropDown: function (editor, caller, callback) {
					var	content   = $('<div />'),
						/** @private */
						clickFunc = function (e) {
							callback($(this).data('size'));
							editor.closeDropDown(true);
							e.preventDefault();
						};

					for (var i = 1; i <= 7; i++) {
						content.append(_tmpl('sizeOpt', {
							size: i
						}, true).click(clickFunc));
					}

					editor.createDropDown(caller, 'fontsize-picker', content);
				},
				exec: function (caller) {
					var editor = this;

					defaultCommnds.size._dropDown(
						editor,
						caller,
						function (fontSize) {
							editor.execCommand('fontsize', fontSize);
						}
					);
				},
				tooltip: 'Font Size'
			},
			// END_COMMAND
			// START_COMMAND: Colour
			color: {
				_dropDown: function (editor, caller, callback) {
					var	content = $('<div />'),
						html    = '',
						cmd     = defaultCommnds.color;

					if (!cmd._htmlCache) {
						editor.opts.colors.split('|').forEach(function (column) {
							html += '<div class="sceditor-color-column">';

							column.split(',').forEach(function (color) {
								html +=
									'<a href="#" class="sceditor-color-option"' +
									' style="background-color: ' + color + '"' +
									' data-color="' + color + '"></a>';
							});

							html += '</div>';
						});

						cmd._htmlCache = html;
					}

					content.html(cmd._htmlCache)
						.find('a')
						.click(function (e) {
							callback($(this).attr('data-color'));
							editor.closeDropDown(true);
							e.preventDefault();
						});

					editor.createDropDown(caller, 'color-picker', content);
				},
				exec: function (caller) {
					var editor = this;

					defaultCommnds.color._dropDown(
						editor,
						caller,
						function (color) {
							editor.execCommand('forecolor', color);
						}
					);
				},
				tooltip: 'Font Color'
			},
			// END_COMMAND
			// START_COMMAND: Remove Format
			removeformat: {
				exec: 'removeformat',
				tooltip: 'Remove Formatting'
			},
			// END_COMMAND

			// START_COMMAND: Cut
			cut: {
				exec: 'cut',
				tooltip: 'Cut',
				errorMessage: 'Your browser does not allow the cut command. ' +
					'Please use the keyboard shortcut Ctrl/Cmd-X'
			},
			// END_COMMAND
			// START_COMMAND: Copy
			copy: {
				exec: 'copy',
				tooltip: 'Copy',
				errorMessage: 'Your browser does not allow the copy command. ' +
					'Please use the keyboard shortcut Ctrl/Cmd-C'
			},
			// END_COMMAND
			// START_COMMAND: Paste
			paste: {
				exec: 'paste',
				tooltip: 'Paste',
				errorMessage: 'Your browser does not allow the paste command. ' +
					'Please use the keyboard shortcut Ctrl/Cmd-V'
			},
			// END_COMMAND
			// START_COMMAND: Paste Text
			pastetext: {
				exec: function (caller) {
					var	val, content,
						editor  = this;

					content = _tmpl('pastetext', {
						label: editor._(
							'Paste your text inside the following box:'
						),
						insert: editor._('Insert')
					}, true);

					content.find('.button').click(function (e) {
						val = content.find('#txt').val();

						if (val) {
							editor.wysiwygEditorInsertText(val);
						}

						editor.closeDropDown(true);
						e.preventDefault();
					});

					editor.createDropDown(caller, 'pastetext', content);
				},
				tooltip: 'Paste Text'
			},
			// END_COMMAND
			// START_COMMAND: Bullet List
			bulletlist: {
				exec: function () {
					fixFirefoxListBug(this);
					this.execCommand('insertunorderedlist');
				},
				tooltip: 'Bullet list'
			},
			// END_COMMAND
			// START_COMMAND: Ordered List
			orderedlist: {
				exec: function () {
					fixFirefoxListBug(this);
					this.execCommand('insertorderedlist');
				},
				tooltip: 'Numbered list'
			},
			// END_COMMAND
			// START_COMMAND: Indent
			indent: {
				state: function (parents, firstBlock) {
					// Only works with lists, for now
					// This is a nested list, so it will always work
					var	range, startParent, endParent,
						$firstBlock = $(firstBlock),
						parentLists = $firstBlock.parents('ul,ol,menu'),
						parentList  = parentLists.first();

					// in case it's a list with only a single <li>
					if (parentLists.length > 1 ||
						parentList.children().length > 1) {
						return 0;
					}

					if ($firstBlock.is('ul,ol,menu')) {
						// if the whole list is selected, then this must be
						// invalidated because the browser will place a
						// <blockquote> there
						range = this.getRangeHelper().selectedRange();

						if (window.Range && range instanceof Range) {
							startParent = range.startContainer.parentNode;
							endParent   = range.endContainer.parentNode;

	// TODO: could use nodeType for this?
	// Maybe just check the firstBlock contains both the start and end containers
							// Select the tag, not the textNode
							// (that's why the parentNode)
							if (startParent !==
								startParent.parentNode.firstElementChild ||
								// work around a bug in FF
								($(endParent).is('li') && endParent !==
									endParent.parentNode.lastElementChild)) {
								return 0;
							}
						// it's IE... As it is impossible to know well when to
						// accept, better safe than sorry
						} else {
							return $firstBlock.is('li,ul,ol,menu') ? 0 : -1;
						}
					}

					return -1;
				},
				exec: function () {
					var editor = this,
						$elm   = $(editor.getRangeHelper().getFirstBlockParent());

					editor.focus();

					// An indent system is quite complicated as there are loads
					// of complications and issues around how to indent text
					// As default, let's just stay with indenting the lists,
					// at least, for now.
					if ($elm.parents('ul,ol,menu')) {
						editor.execCommand('indent');
					}
				},
				tooltip: 'Add indent'
			},
			// END_COMMAND
			// START_COMMAND: Outdent
			outdent: {
				state: function (parents, firstBlock) {
					return $(firstBlock).is('ul,ol,menu') ||
						$(firstBlock).parents('ul,ol,menu').length > 0 ? 0 : -1;
				},
				exec: function () {
					var	editor = this,
						$elm   = $(editor.getRangeHelper().getFirstBlockParent());

					if ($elm.parents('ul,ol,menu')) {
						editor.execCommand('outdent');
					}
				},
				tooltip: 'Remove one indent'
			},
			// END_COMMAND

			// START_COMMAND: Table
			table: {
				exec: function (caller) {
					var	editor  = this,
						content = _tmpl('table', {
							rows: editor._('Rows:'),
							cols: editor._('Cols:'),
							insert: editor._('Insert')
						}, true);

					content.find('.button').click(function (e) {
						var	row, col,
							rows = content.find('#rows').val() - 0,
							cols = content.find('#cols').val() - 0,
							html = '<table>';

						if (rows < 1 || cols < 1) {
							return;
						}

						for (row = 0; row < rows; row++) {
							html += '<tr>';

							for (col = 0; col < cols; col++) {
								html += '<td>' +
										(IE_BR_FIX ? '' : '<br />') +
									'</td>';
							}

							html += '</tr>';
						}

						html += '</table>';

						editor.wysiwygEditorInsertHtml(html);
						editor.closeDropDown(true);
						e.preventDefault();
					});

					editor.createDropDown(caller, 'inserttable', content);
				},
				tooltip: 'Insert a table'
			},
			// END_COMMAND

			// START_COMMAND: Horizontal Rule
			horizontalrule: {
				exec: 'inserthorizontalrule',
				tooltip: 'Insert a horizontal rule'
			},
			// END_COMMAND

			// START_COMMAND: Code
			code: {
				exec: function () {
					this.wysiwygEditorInsertHtml(
						'<code>',
						(IE_BR_FIX ? '' : '<br />') + '</code>'
					);
				},
				tooltip: 'Code'
			},
			// END_COMMAND

			// START_COMMAND: Image
			image: {
				_dropDown: function (editor, caller, cb) {
					var content = _tmpl('image', {
						url: editor._('URL:'),
						width: editor._('Width (optional):'),
						height: editor._('Height (optional):'),
						insert: editor._('Insert')
					}, true);

					var	urlInput = content.find('#image');

					content.find('.button').click(function (e) {
						if (urlInput.val()) {
							cb(
								urlInput.val(),
								content.find('#width').val(),
								content.find('#height').val()
							);
						}

						editor.closeDropDown(true);
						e.preventDefault();
					});

					editor.createDropDown(caller, 'insertimage', content);
				},
				exec: function (caller) {
					var	editor  = this;

					defaultCommnds.image._dropDown(
						editor,
						caller,
						function (url, width, height) {
							var attrs  = '';

							if (width) {
								attrs += ' width="' + width + '"';
							}

							if (height) {
								attrs += ' height="' + height + '"';
							}

							editor.wysiwygEditorInsertHtml(
								'<img' + attrs + ' src="' + url + '" />'
							);
						}
					);
				},
				tooltip: 'Insert an image'
			},
			// END_COMMAND

			// START_COMMAND: E-mail
			email: {
				_dropDown: function (editor, caller, cb) {
					var content = _tmpl('email', {
						label: editor._('E-mail:'),
						desc: editor._('Description (optional):'),
						insert: editor._('Insert')
					}, true);

					var emailInput = content.find('#email');

					function insertEmail(e) {
						if (emailInput.val()) {
							cb(emailInput.val(), content.find('#des').val());
						}

						editor.closeDropDown(true);
						e.preventDefault();
					}

					content.find('.button').click(insertEmail);
					emailInput.add(content.find('#des')).keypress(function (e) {
						// 13 = enter key
						if (e.which === 13 && emailInput.val()) {
							insertEmail(e);
						}
					});

					editor.createDropDown(caller, 'insertemail', content);
				},
				exec: function (caller) {
					var	editor  = this;

					defaultCommnds.email._dropDown(
						editor,
						caller,
						function (email, text) {
							// needed for IE to reset the last range
							editor.focus();

							if (!editor.getRangeHelper().selectedHtml() || text) {
								editor.wysiwygEditorInsertHtml(
									'<a href="' + 'mailto:' + email + '">' +
									(text || email) +
									'</a>'
								);
							} else {
								editor.execCommand('createlink', 'mailto:' + email);
							}
						}
					);
				},
				tooltip: 'Insert an email'
			},
			// END_COMMAND

			// START_COMMAND: Link
			link: {
				_dropDown: function (editor, caller, cb) {
					var content = _tmpl('link', {
						url: editor._('URL:'),
						desc: editor._('Description (optional):'),
						ins: editor._('Insert')
					}, true);

					var linkInput = content.find('#link');

					function insertUrl(e) {
						if (linkInput.val()) {
							cb(linkInput.val(), content.find('#des').val());
						}

						editor.closeDropDown(true);
						e.preventDefault();
					}

					content.find('.button').click(insertUrl);
					linkInput.add(content.find('#des')).keypress(function (e) {
						// 13 = enter key
						if (e.which === 13 && linkInput.val()) {
							insertUrl(e);
						}
					});

					editor.createDropDown(caller, 'insertlink', content);
				},
				exec: function (caller) {
					var editor = this;

					defaultCommnds.link._dropDown(
						editor,
						caller,
						function (url, text) {
							// needed for IE to restore the last range
							editor.focus();

							// If there is no selected text then must set the URL as
							// the text. Most browsers do this automatically, sadly
							// IE doesn't.
							if (!editor.getRangeHelper().selectedHtml() || text) {
								text = text || url;

								editor.wysiwygEditorInsertHtml(
									'<a href="' + url + '">' + text + '</a>'
								);
							} else {
								editor.execCommand('createlink', url);
							}
						}
					);
				},
				tooltip: 'Insert a link'
			},
			// END_COMMAND

			// START_COMMAND: Unlink
			unlink: {
				state: function () {
					var $current = $(this.currentNode());
					return $current.is('a') ||
						$current.parents('a').length > 0 ? 0 : -1;
				},
				exec: function () {
					var	$current = $(this.currentNode()),
						$anchor  = $current.is('a') ? $current :
							$current.parents('a').first();

					if ($anchor.length) {
						$anchor.replaceWith($anchor.contents());
					}
				},
				tooltip: 'Unlink'
			},
			// END_COMMAND

			// START_COMMAND: Quote
			quote: {
				exec: function (caller, html, author) {
					var	before = '<blockquote>',
						end    = '</blockquote>';

					// if there is HTML passed set end to null so any selected
					// text is replaced
					if (html) {
						author = (author ? '<cite>' + author + '</cite>' : '');
						before = before + author + html + end;
						end    = null;
					// if not add a newline to the end of the inserted quote
					} else if (this.getRangeHelper().selectedHtml() === '') {
						end = (IE_BR_FIX ? '' : '<br />') + end;
					}

					this.wysiwygEditorInsertHtml(before, end);
				},
				tooltip: 'Insert a Quote'
			},
			// END_COMMAND

			// START_COMMAND: Emoticons
			emoticon: {
				exec: function (caller) {
					var editor = this;

					var createContent = function (includeMore) {
						var	$moreLink,
							emoticonsCompat = editor.opts.emoticonsCompat,
							rangeHelper     = editor.getRangeHelper(),
							startSpace      = emoticonsCompat &&
								rangeHelper.getOuterText(true, 1) !== ' ' ?
								' ' : '',
							endSpace        = emoticonsCompat &&
								rangeHelper.getOuterText(false, 1) !== ' ' ?
								' ' : '',
							$content        = $('<div />'),
							$line           = $('<div />').appendTo($content),
							perLine         = 0,
							emoticons       = $.extend(
								{},
								editor.opts.emoticons.dropdown,
								includeMore ? editor.opts.emoticons.more : {}
							);

						$.each(emoticons, function () {
							perLine++;
						});
						perLine = Math.sqrt(perLine);

						$.each(emoticons, function (code, emoticon) {
							$line.append(
								$('<img />').attr({
									src: emoticon.url || emoticon,
									alt: code,
									title: emoticon.tooltip || code
								}).click(function () {
									editor.insert(startSpace + $(this).attr('alt') +
										endSpace, null, false).closeDropDown(true);

									return false;
								})
							);

							if ($line.children().length >= perLine) {
								$line = $('<div />').appendTo($content);
							}
						});

						if (!includeMore && editor.opts.emoticons.more) {
							$moreLink = $(
								'<a class="sceditor-more">' +
									editor._('More') + '</a>'
							).click(function () {
								editor.createDropDown(
									caller,
									'more-emoticons',
									createContent(true)
								);

								return false;
							});

							$content.append($moreLink);
						}

						return $content;
					};

					editor.createDropDown(
						caller,
						'emoticons',
						createContent(false)
					);
				},
				txtExec: function (caller) {
					defaultCommnds.emoticon.exec.call(this, caller);
				},
				tooltip: 'Insert an emoticon'
			},
			// END_COMMAND

			// START_COMMAND: YouTube
			youtube: {
				_dropDown: function (editor, caller, callback) {
					var	content = _tmpl('youtubeMenu', {
						label: editor._('Video URL:'),
						insert: editor._('Insert')
					}, true);

					content.find('.button').click(function (e) {
						var val = content.find(content, '#link').val();
						var idMatch = val.match(/(?:v=|v\/|embed\/|youtu.be\/)(.{11})/);
						var timeMatch = val.match(/[&|?](?:star)?t=((\d+[hms]?){1,3})/);
						var time = 0;

						if (timeMatch) {
							$.each(timeMatch[1].split(/[hms]/), function (i, val) {
								if (val !== '') {
									time = (time * 60) + Number(val);
								}
							});
						}

						if (idMatch && /^[a-zA-Z0-9_\-]{11}$/.test(idMatch[1])) {
							callback(idMatch[1], time);
						}

						editor.closeDropDown(true);
						e.preventDefault();
					});

					editor.createDropDown(caller, 'insertlink', content);
				},
				exec: function (caller) {
					var editor = this;

					defaultCommnds.youtube._dropDown(
						editor,
						caller,
						function (id) {
							editor.wysiwygEditorInsertHtml(_tmpl('youtube', {
								id: id
							}));
						}
					);
				},
				tooltip: 'Insert a YouTube video'
			},
			// END_COMMAND

			// START_COMMAND: Date
			date: {
				_date: function (editor) {
					var	now   = new Date(),
						year  = now.getYear(),
						month = now.getMonth() + 1,
						day   = now.getDate();

					if (year < 2000) {
						year = 1900 + year;
					}

					if (month < 10) {
						month = '0' + month;
					}

					if (day < 10) {
						day = '0' + day;
					}

					return editor.opts.dateFormat
						.replace(/year/i, year)
						.replace(/month/i, month)
						.replace(/day/i, day);
				},
				exec: function () {
					this.insertText(defaultCommnds.date._date(this));
				},
				txtExec: function () {
					this.insertText(defaultCommnds.date._date(this));
				},
				tooltip: 'Insert current date'
			},
			// END_COMMAND

			// START_COMMAND: Time
			time: {
				_time: function () {
					var	now   = new Date(),
						hours = now.getHours(),
						mins  = now.getMinutes(),
						secs  = now.getSeconds();

					if (hours < 10) {
						hours = '0' + hours;
					}

					if (mins < 10) {
						mins = '0' + mins;
					}

					if (secs < 10) {
						secs = '0' + secs;
					}

					return hours + ':' + mins + ':' + secs;
				},
				exec: function () {
					this.insertText(defaultCommnds.time._time());
				},
				txtExec: function () {
					this.insertText(defaultCommnds.time._time());
				},
				tooltip: 'Insert current time'
			},
			// END_COMMAND


			// START_COMMAND: Ltr
			ltr: {
				state: function (parents, firstBlock) {
					return firstBlock && firstBlock.style.direction === 'ltr';
				},
				exec: function () {
					var	editor = this,
						elm    = editor.getRangeHelper().getFirstBlockParent(),
						$elm   = $(elm);

					editor.focus();

					if (!elm || $elm.is('body')) {
						editor.execCommand('formatBlock', 'p');

						elm  = editor.getRangeHelper().getFirstBlockParent();
						$elm = $(elm);

						if (!elm || $elm.is('body')) {
							return;
						}
					}

					if ($elm.css('direction') === 'ltr') {
						$elm.css('direction', '');
					} else {
						$elm.css('direction', 'ltr');
					}
				},
				tooltip: 'Left-to-Right'
			},
			// END_COMMAND

			// START_COMMAND: Rtl
			rtl: {
				state: function (parents, firstBlock) {
					return firstBlock && firstBlock.style.direction === 'rtl';
				},
				exec: function () {
					var	editor = this,
						elm    = editor.getRangeHelper().getFirstBlockParent(),
						$elm   = $(elm);

					editor.focus();

					if (!elm || $elm.is('body')) {
						editor.execCommand('formatBlock', 'p');

						elm  = editor.getRangeHelper().getFirstBlockParent();
						$elm = $(elm);

						if (!elm || $elm.is('body')) {
							return;
						}
					}

					if ($elm.css('direction') === 'rtl') {
						$elm.css('direction', '');
					} else {
						$elm.css('direction', 'rtl');
					}
				},
				tooltip: 'Right-to-Left'
			},
			// END_COMMAND


			// START_COMMAND: Print
			print: {
				exec: 'print',
				tooltip: 'Print'
			},
			// END_COMMAND

			// START_COMMAND: Maximize
			maximize: {
				state: function () {
					return this.maximize();
				},
				exec: function () {
					this.maximize(!this.maximize());
				},
				txtExec: function () {
					this.maximize(!this.maximize());
				},
				tooltip: 'Maximize',
				shortcut: 'Ctrl+Shift+M'
			},
			// END_COMMAND

			// START_COMMAND: Source
			source: {
				state: function () {
					return this.sourceMode();
				},
				exec: function () {
					this.toggleSourceMode();
				},
				txtExec: function () {
					this.toggleSourceMode();
				},
				tooltip: 'View source',
				shortcut: 'Ctrl+Shift+S'
			},
			// END_COMMAND

			// this is here so that commands above can be removed
			// without having to remove the , after the last one.
			// Needed for IE.
			ignore: {}
		};

		return defaultCommnds;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {
		'use strict';

		var $ = __webpack_require__(1);


		/**
		 * Default options for SCEditor
		 * @type {Object}
		 */
		return {
			/** @lends jQuery.sceditor.defaultOptions */
			/**
			 * Toolbar buttons order and groups. Should be comma separated and
			 * have a bar | to separate groups
			 *
			 * @type {String}
			 */
			toolbar: 'bold,italic,underline,strike,subscript,superscript|' +
				'left,center,right,justify|font,size,color,removeformat|' +
				'cut,copy,paste,pastetext|bulletlist,orderedlist,indent,outdent|' +
				'table|code,quote|horizontalrule,image,email,link,unlink|' +
				'emoticon,youtube,date,time|ltr,rtl|print,maximize,source',

			/**
			 * Comma separated list of commands to excludes from the toolbar
			 *
			 * @type {String}
			 */
			toolbarExclude: null,

			/**
			 * Stylesheet to include in the WYSIWYG editor. This is what will style
			 * the WYSIWYG elements
			 *
			 * @type {String}
			 */
			style: 'jquery.sceditor.default.css',

			/**
			 * Comma separated list of fonts for the font selector
			 *
			 * @type {String}
			 */
			fonts: 'Arial,Arial Black,Comic Sans MS,Courier New,Georgia,Impact,' +
				'Sans-serif,Serif,Times New Roman,Trebuchet MS,Verdana',

			/**
			 * Colors should be comma separated and have a bar | to signal a new
			 * column.
			 *
			 * If null the colors will be auto generated.
			 *
			 * @type {string}
			 */
			colors: '#000,#44B8FF,#1E92F7,#0074D9,#005DC2,#00369B,#b3d5f4|' +
					'#444,#C3FFFF,#9DF9FF,#7FDBFF,#68C4E8,#419DC1,#d9f4ff|' +
					'#666,#72FF84,#4CEA5E,#2ECC40,#17B529,#008E02,#c0f0c6|' +
					'#888,#FFFF44,#FFFA1E,#FFDC00,#E8C500,#C19E00,#fff5b3|' +
					'#aaa,#FFC95F,#FFA339,#FF851B,#E86E04,#C14700,#ffdbbb|' +
					'#ccc,#FF857A,#FF5F54,#FF4136,#E82A1F,#C10300,#ffc6c3|' +
					'#eee,#FF56FF,#FF30DC,#F012BE,#D900A7,#B20080,#fbb8ec|' +
					'#fff,#F551FF,#CF2BE7,#B10DC9,#9A00B2,#9A00B2,#e8b6ef',

			/**
			 * The locale to use.
			 * @type {String}
			 */
			locale: $('html').attr('lang') || 'en',

			/**
			 * The Charset to use
			 * @type {String}
			 */
			charset: 'utf-8',

			/**
			 * Compatibility mode for emoticons.
			 *
			 * Helps if you have emoticons such as :/ which would put an emoticon
			 * inside http://
			 *
			 * This mode requires emoticons to be surrounded by whitespace or end of
			 * line chars. This mode has limited As You Type emoticon conversion
			 * support. It will not replace AYT for end of line chars, only
			 * emoticons surrounded by whitespace. They will still be replaced
			 * correctly when loaded just not AYT.
			 *
			 * @type {Boolean}
			 */
			emoticonsCompat: false,

			/**
			 * If to enable emoticons. Can be changes at runtime using the
			 * emoticons() method.
			 *
			 * @type {Boolean}
			 * @since 1.4.2
			 */
			emoticonsEnabled: true,

			/**
			 * Emoticon root URL
			 *
			 * @type {String}
			 */
			emoticonsRoot: '',
			emoticons: {
				dropdown: {
					':)': 'emoticons/smile.png',
					':angel:': 'emoticons/angel.png',
					':angry:': 'emoticons/angry.png',
					'8-)': 'emoticons/cool.png',
					':\'(': 'emoticons/cwy.png',
					':ermm:': 'emoticons/ermm.png',
					':D': 'emoticons/grin.png',
					'<3': 'emoticons/heart.png',
					':(': 'emoticons/sad.png',
					':O': 'emoticons/shocked.png',
					':P': 'emoticons/tongue.png',
					';)': 'emoticons/wink.png'
				},
				more: {
					':alien:': 'emoticons/alien.png',
					':blink:': 'emoticons/blink.png',
					':blush:': 'emoticons/blush.png',
					':cheerful:': 'emoticons/cheerful.png',
					':devil:': 'emoticons/devil.png',
					':dizzy:': 'emoticons/dizzy.png',
					':getlost:': 'emoticons/getlost.png',
					':happy:': 'emoticons/happy.png',
					':kissing:': 'emoticons/kissing.png',
					':ninja:': 'emoticons/ninja.png',
					':pinch:': 'emoticons/pinch.png',
					':pouty:': 'emoticons/pouty.png',
					':sick:': 'emoticons/sick.png',
					':sideways:': 'emoticons/sideways.png',
					':silly:': 'emoticons/silly.png',
					':sleeping:': 'emoticons/sleeping.png',
					':unsure:': 'emoticons/unsure.png',
					':woot:': 'emoticons/w00t.png',
					':wassat:': 'emoticons/wassat.png'
				},
				hidden: {
					':whistling:': 'emoticons/whistling.png',
					':love:': 'emoticons/wub.png'
				}
			},

			/**
			 * Width of the editor. Set to null for automatic with
			 *
			 * @type {int}
			 */
			width: null,

			/**
			 * Height of the editor including toolbar. Set to null for automatic
			 * height
			 *
			 * @type {int}
			 */
			height: null,

			/**
			 * If to allow the editor to be resized
			 *
			 * @type {Boolean}
			 */
			resizeEnabled: true,

			/**
			 * Min resize to width, set to null for half textarea width or -1 for
			 * unlimited
			 *
			 * @type {int}
			 */
			resizeMinWidth: null,
			/**
			 * Min resize to height, set to null for half textarea height or -1 for
			 * unlimited
			 *
			 * @type {int}
			 */
			resizeMinHeight: null,
			/**
			 * Max resize to height, set to null for double textarea height or -1
			 * for unlimited
			 *
			 * @type {int}
			 */
			resizeMaxHeight: null,
			/**
			 * Max resize to width, set to null for double textarea width or -1 for
			 * unlimited
			 *
			 * @type {int}
			 */
			resizeMaxWidth: null,
			/**
			 * If resizing by height is enabled
			 *
			 * @type {Boolean}
			 */
			resizeHeight: true,
			/**
			 * If resizing by width is enabled
			 *
			 * @type {Boolean}
			 */
			resizeWidth: true,

			/**
			 * Date format, will be overridden if locale specifies one.
			 *
			 * The words year, month and day will be replaced with the users current
			 * year, month and day.
			 *
			 * @type {String}
			 */
			dateFormat: 'year-month-day',

			/**
			 * Element to inset the toolbar into.
			 *
			 * @type {HTMLElement}
			 */
			toolbarContainer: null,

			/**
			 * If to enable paste filtering. This is currently experimental, please
			 * report any issues.
			 *
			 * @type {Boolean}
			 */
			enablePasteFiltering: false,

			/**
			 * If to completely disable pasting into the editor
			 *
			 * @type {Boolean}
			 */
			disablePasting: false,

			/**
			 * If the editor is read only.
			 *
			 * @type {Boolean}
			 */
			readOnly: false,

			/**
			 * If to set the editor to right-to-left mode.
			 *
			 * If set to null the direction will be automatically detected.
			 *
			 * @type {Boolean}
			 */
			rtl: false,

			/**
			 * If to auto focus the editor on page load
			 *
			 * @type {Boolean}
			 */
			autofocus: false,

			/**
			 * If to auto focus the editor to the end of the content
			 *
			 * @type {Boolean}
			 */
			autofocusEnd: true,

			/**
			 * If to auto expand the editor to fix the content
			 *
			 * @type {Boolean}
			 */
			autoExpand: false,

			/**
			 * If to auto update original textbox on blur
			 *
			 * @type {Boolean}
			 */
			autoUpdate: false,

			/**
			 * If to enable the browsers built in spell checker
			 *
			 * @type {Boolean}
			 */
			spellcheck: true,

			/**
			 * If to run the source editor when there is no WYSIWYG support. Only
			 * really applies to mobile OS's.
			 *
			 * @type {Boolean}
			 */
			runWithoutWysiwygSupport: false,

			/**
			 * If to load the editor in source mode and still allow switching
			 * between WYSIWYG and source mode
			 *
			 * @type {Boolean}
			 */
			startInSourceMode: false,

			/**
			 * Optional ID to give the editor.
			 *
			 * @type {String}
			 */
			id: null,

			/**
			 * Comma separated list of plugins
			 *
			 * @type {String}
			 */
			plugins: '',

			/**
			 * z-index to set the editor container to. Needed for jQuery UI dialog.
			 *
			 * @type {Int}
			 */
			zIndex: null,

			/**
			 * If to trim the BBCode. Removes any spaces at the start and end of the
			 * BBCode string.
			 *
			 * @type {Boolean}
			 */
			bbcodeTrim: false,

			/**
			 * If to disable removing block level elements by pressing backspace at
			 * the start of them
			 *
			 * @type {Boolean}
			 */
			disableBlockRemove: false,

			/**
			 * BBCode parser options, only applies if using the editor in BBCode
			 * mode.
			 *
			 * See SCEditor.BBCodeParser.defaults for list of valid options
			 *
			 * @type {Object}
			 */
			parserOptions: { },

			/**
			 * CSS that will be added to the to dropdown menu (eg. z-index)
			 *
			 * @type {Object}
			 */
			dropDownCss: { }
		};
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ })
/******/ ]);;/**
 * SCEditor XHTML Plugin
 * http://www.sceditor.com/
 *
 * Copyright (C) 2011-2013, Sam Clarke (samclarke.com)
 *
 * SCEditor is licensed under the MIT license:
 *	http://www.opensource.org/licenses/mit-license.php
 *
 * @author Sam Clarke
 * @requires jQuery
 */
/*global prompt: true*/
(function ($) {
	'use strict';

	var SCEditor        = $.sceditor;
	var sceditorPlugins = SCEditor.plugins;
	var dom             = SCEditor.dom;

	var defaultCommandsOverrides = {
		bold: {
			txtExec: [
				'<strong>',
				'</strong>'
			]
		},
		italic: {
			txtExec: [
				'<em>',
				'</em>'
			]
		},
		underline: {
			txtExec: [
				'<span style="text-decoration: underline;">',
				'</span>'
			]
		},
		strike: {
			txtExec: [
				'<span style="text-decoration: line-through;">',
				'</span>'
			]
		},
		subscript: {
			txtExec: [
				'<sub>',
				'</sub>'
			]
		},
		superscript: {
			txtExec: [
				'<sup>',
				'</sup>'
			]
		},
		left: {
			txtExec: [
				'<div style="text-align: left;">',
				'</div>'
			]
		},
		center: {
			txtExec: [
				'<div style="text-align: center;">',
				'</div>'
			]
		},
		right: {
			txtExec: [
				'<div style="text-align: right;">',
				'</div>'
			]
		},
		justify: {
			txtExec: [
				'<div style="text-align: justify;">',
				'</div>'
			]
		},
		font: {
			txtExec: function (caller) {
				var editor = this;

				SCEditor.command.get('font')._dropDown(
					editor,
					caller,
					function (fontName) {
						editor.insertText('<span style="font-family: ' +
							fontName + ';">', '</span>');
					}
				);
			}
		},
		size: {
			txtExec: function (caller) {
				var editor = this;

				SCEditor.command.get('size')._dropDown(
					editor,
					caller,
					function (fontSize) {
						editor.insertText('<span style="font-size: ' +
							fontSize + ';">', '</span>');
					}
				);
			}
		},
		color: {
			txtExec: function (caller) {
				var editor = this;

				SCEditor.command.get('color')._dropDown(
					editor,
					caller,
					function (color) {
						editor.insertText('<span style="color: ' +
							color + ';">', '</span>');
					}
				);
			}
		},
		bulletlist: {
			txtExec: [
				'<ul><li>',
				'</li></ul>'
			]
		},
		orderedlist: {
			txtExec: [
				'<ol><li>',
				'</li></ol>'
			]
		},
		table: {
			txtExec: [
				'<table><tr><td>',
				'</td></tr></table>'
			]
		},
		horizontalrule: {
			txtExec: [
				'<hr />'
			]
		},
		code: {
			txtExec: [
				'<code>',
				'</code>'
			]
		},
		image: {
			txtExec: function (caller, selected) {
				var url = prompt(this._('Enter the image URL:'), selected);

				if (url) {
					this.insertText('<img src="' + url + '" />');
				}
			}
		},
		email: {
			txtExec: function (caller, sel) {
				var	email, text,
					display = sel && sel.indexOf('@') > -1 ? null : sel;

				email = prompt(
					this._('Enter the e-mail address:'),
					(display ? '' : sel)
				);

				text = prompt(
					this._('Enter the displayed text:'),
					display || email
				) || email;

				if (email) {
					this.insertText(
						'<a href="mailto:' + email + '">' + text + '</a>'
					);
				}
			}
		},
		link: {
			txtExec: function (caller, sel) {
				var display = sel && sel.indexOf('http://') > -1 ? null : sel,
					url  = prompt(this._('Enter URL:'),
						(display ? 'http://' : sel)),
					text = prompt(this._('Enter the displayed text:'),
						display || url) || url;

				if (url) {
					this.insertText(
						'<a href="' + url + '">' + text + '</a>'
					);
				}
			}
		},
		quote: {
			txtExec: [
				'<blockquote>',
				'</blockquote>'
			]
		},
		youtube: {
			txtExec: function (caller) {
				var editor = this;

				SCEditor.command.get('youtube')._dropDown(
					editor,
					caller,
					function (id) {
						editor.insertText(
							'<iframe width="560" height="315" ' +
							'src="https://www.youtube.com/embed/{id}?' +
							'wmode=opaque" data-youtube-id="' + id + '" ' +
							'frameborder="0" allowfullscreen></iframe>'
						);
					}
				);
			}
		},
		rtl: {
			txtExec: [
				'<div stlye="direction: rtl;">',
				'</div>'
			]
		},
		ltr: {
			txtExec: [
				'<div stlye="direction: ltr;">',
				'</div>'
			]
		}
	};

	/**
	 * XHTMLSerializer part of the XHTML plugin.
	 *
	 * @class XHTMLSerializer
	 * @name jQuery.sceditor.XHTMLSerializer
	 * @since v1.4.1
	 */
	SCEditor.XHTMLSerializer = function () {
		var base = this;

		var opts = {
			indentStr: '\t'
		};

		/**
		 * Array containing the output, used as it's faster
		 * than string concatenation in slow browsers.
		 * @type {Array}
		 * @private
		 */
		var outputStringBuilder = [];

		/**
		 * Current indention level
		 * @type {Number}
		 * @private
		 */
		var currentIndent = 0;

		/**
		 * @private
		 */
		var	escapeEntites,
			trim,
			serializeNode,
			handleDoc,
			handleElement,
			handleCdata,
			handleComment,
			handleText,
			output,
			canIndent;
// TODO: use escape.entities
		/**
		 * Escapes XHTML entities
		 *
		 * @param  {String} str
		 * @return {String}
		 * @private
		 */
		escapeEntites = function (str) {
			var entites = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;'
			};

			return !str ? '' : str.replace(/[&<>"]/g, function (entity) {
				return entites[entity] || entity;
			});
		};

		/**
		 * @param  {string} str
		 * @return {string}
		 * @private
		 */
		trim = function (str) {
			return str
				// New lines will be shown as spaces so just convert to spaces.
				.replace(/[\r\n]/, ' ')
				.replace(/[^\S|\u00A0]+/g, ' ');
		};

		/**
		 * Serializes a node to XHTML
		 *
		 * @param  {Node} node            Node to serialize
		 * @param  {Boolean} onlyChildren If to only serialize the nodes
		 *                                children and not the node
		 *                                itself
		 * @return {String}               The serialized node
		 * @name serialize
		 * @memberOf jQuery.sceditor.XHTMLSerializer.prototype
		 * @since v1.4.1
		 */
		base.serialize = function (node, onlyChildren) {
			outputStringBuilder = [];

			if (onlyChildren) {
				node = node.firstChild;

				while (node) {
					serializeNode(node);
					node = node.nextSibling;
				}
			} else {
				serializeNode(node);
			}

			return outputStringBuilder.join('');
		};

		/**
		 * Serializes a node to the outputStringBuilder
		 *
		 * @param  {Node} node
		 * @return {Void}
		 * @private
		 */
		serializeNode = function (node, parentIsPre) {
			switch (node.nodeType) {
				case 1: // element
					var tagName = node.nodeName.toLowerCase();

					// IE comment
					if (tagName === '!') {
						handleComment(node);
					} else {
						handleElement(node, parentIsPre);
					}
					break;

				case 3: // text
					handleText(node, parentIsPre);
					break;

				case 4: // cdata section
					handleCdata(node);
					break;

				case 8: // comment
					handleComment(node);
					break;

				case 9: // document
				case 11: // document fragment
					handleDoc(node);
					break;

				// Ignored types
				case 2: // attribute
				case 5: // entity ref
				case 6: // entity
				case 7: // processing instruction
				case 10: // document type
				case 12: // notation
					break;
			}
		};

		/**
		 * Handles doc node
		 * @param  {Node} node
		 * @return {void}
		 * @private
		 */
		handleDoc = function (node) {
			var	child = node.firstChild;

			while (child) {
				serializeNode(child);
				child = child.nextSibling;
			}
		};

		/**
		 * Handles element nodes
		 * @param  {Node} node
		 * @return {void}
		 * @private
		 */
		handleElement = function (node, parentIsPre) {
			var	child, attr, attrValue,
				tagName     = node.nodeName.toLowerCase(),
				isIframe    = tagName === 'iframe',
				attrIdx     = node.attributes.length,
				firstChild  = node.firstChild,
				// pre || pre-wrap with any vendor prefix
				isPre       = parentIsPre ||
					/pre(?:\-wrap)?$/i.test($(node).css('whiteSpace')),
				selfClosing = !node.firstChild && !dom.canHaveChildren(node) &&
					!isIframe;

			if ($(node).hasClass('sceditor-ignore')) {
				return;
			}

			output('<' + tagName, !parentIsPre && canIndent(node));
			while (attrIdx--) {
				attr = node.attributes[attrIdx];

				attrValue = attr.value;

				output(' ' + attr.name.toLowerCase() + '="' +
					escapeEntites(attrValue) + '"', false);
			}
			output(selfClosing ? ' />' : '>', false);

			if (!isIframe) {
				child = firstChild;
			}

			while (child) {
				currentIndent++;

				serializeNode(child, isPre);
				child = child.nextSibling;

				currentIndent--;
			}

			if (!selfClosing) {
				output(
					'</' + tagName + '>',
					!isPre && !isIframe && canIndent(node) &&
						firstChild && canIndent(firstChild)
				);
			}
		};

		/**
		 * Handles CDATA nodes
		 * @param  {Node} node
		 * @return {void}
		 * @private
		 */
		handleCdata =  function (node) {
			output('<![CDATA[' + escapeEntites(node.nodeValue) + ']]>');
		};

		/**
		 * Handles comment nodes
		 * @param  {Node} node
		 * @return {void}
		 * @private
		 */
		handleComment = function (node) {
			output('<!-- ' + escapeEntites(node.nodeValue) + ' -->');
		};

		/**
		 * Handles text nodes
		 * @param  {Node} node
		 * @return {void}
		 * @private
		 */
		handleText = function (node, parentIsPre) {
			var text = node.nodeValue;

			if (!parentIsPre) {
				text = trim(text);
			}

			if (text) {
				output(escapeEntites(text), !parentIsPre && canIndent(node));
			}
		};

		/**
		 * Adds a string to the outputStringBuilder.
		 *
		 * The string will be indented unless indent is set to boolean false.
		 * @param  {String} str
		 * @param  {Boolean} indent
		 * @return {void}
		 * @private
		 */
		output = function (str, indent) {
			var i = currentIndent;

			if (indent !== false) {
				// Don't add a new line if it's the first element
				if (outputStringBuilder.length) {
					outputStringBuilder.push('\n');
				}

				while (i--) {
					outputStringBuilder.push(opts.indentStr);
				}
			}

			outputStringBuilder.push(str);
		};

		/**
		 * Checks if should indent the node or not
		 * @param  {Node} node
		 * @return {boolean}
		 * @private
		 */
		canIndent = function (node) {
			var prev = node.previousSibling;

			if (node.nodeType !== 1 && prev) {
				return !dom.isInline(prev);
			}

			// first child of a block element
			if (!prev && !dom.isInline(node.parentNode)) {
				return true;
			}

			return !dom.isInline(node);
		};
	};

	/**
	 * SCEditor XHTML plugin
	 * @class xhtml
	 * @name jQuery.sceditor.plugins.xhtml
	 * @since v1.4.1
	 */
	sceditorPlugins.xhtml = function () {
		var base = this;

		/**
		 * Tag converstions cache
		 * @type {Object}
		 * @private
		 */
		var tagConvertersCache = {};

		/**
		 * Attributes filter cache
		 * @type {Object}
		 * @private
		 */
		var attrsCache = {};

		/**
		 * Private methods
		 * @private
		 */
		var	convertTags,
			convertNode,
			isEmpty,
			removeTags,
			mergeAttribsFilters,
			removeAttribs,
			wrapInlines;


		/**
		 * Init
		 * @return {void}
		 */
		base.init = function () {
			if (!$.isEmptyObject(sceditorPlugins.xhtml.converters || {})) {
				$.each(
					sceditorPlugins.xhtml.converters,
					function (idx, converter) {
						$.each(converter.tags, function (tagname) {
							if (!tagConvertersCache[tagname]) {
								tagConvertersCache[tagname] = [];
							}

							tagConvertersCache[tagname].push(converter);
						});
					}
				);
			}

			this.commands = $.extend(true,
				{}, defaultCommandsOverrides, this.commands);
		};

		/**
		 * Converts the WYSIWYG content to XHTML
		 * @param  {String} html
		 * @param  {Node} domBody
		 * @return {String}
		 * @memberOf jQuery.sceditor.plugins.xhtml.prototype
		 */
		base.signalToSource = function (html, domBody) {
			domBody = domBody.jquery ? domBody[0] : domBody;

			convertTags(domBody);
			removeTags(domBody);
			removeAttribs(domBody);
			wrapInlines(domBody);

			return (new SCEditor.XHTMLSerializer()).serialize(domBody, true);
		};

		/**
		 * Converts the XHTML to WYSIWYG content.
		 *
		 * This doesn't currently do anything as XHTML
		 * is valid WYSIWYG content.
		 * @param  {String} text
		 * @return {String}
		 * @memberOf jQuery.sceditor.plugins.xhtml.prototype
		 */
		base.signalToWysiwyg = function (text) {
			return text;
		};

		/**
		 * Deprecated, use dom.convertElement() instead.
		 * @deprecated
		 */
		base.convertTagTo = dom.convertElement;

		/**
		 * Runs all converters for the specified tagName
		 * against the DOM node.
		 * @param  {String} tagName
		 * @param  {jQuery} $node
		 * @return {Node} node
		 * @private
		 */
		convertNode = function (tagName, $node, node) {
			if (!tagConvertersCache[tagName]) {
				return;
			}

			$.each(tagConvertersCache[tagName], function (idx, converter) {
				if (converter.tags[tagName]) {
					$.each(converter.tags[tagName], function (attr, values) {
						if (!node.getAttributeNode) {
							return;
						}

						attr = node.getAttributeNode(attr);

						if (!attr) {
							return;
						}

						if (values && $.inArray(attr.value, values) < 0) {
							return;
						}

						converter.conv.call(base, node, $node);
					});
				} else if (converter.conv) {
					converter.conv.call(base, node, $node);
				}
			});
		};

		/**
		 * Converts any tags/attributes to their XHTML equivalents
		 * @param  {Node} node
		 * @return {Void}
		 * @private
		 */
		convertTags = function (node) {
			dom.traverse(node, function (node) {
				var	$node   = $(node),
					tagName = node.nodeName.toLowerCase();

				convertNode('*', $node, node);
				convertNode(tagName, $node, node);
			}, true);
		};

		/**
		 * Tests if a node is empty and can be removed.
		 *
		 * @param  {Node} node
		 * @return {Boolean}
		 * @private
		 */
		isEmpty = function (node, excludeBr) {
			var	childNodes     = node.childNodes,
				tagName        = node.nodeName.toLowerCase(),
				nodeValue      = node.nodeValue,
				childrenLength = childNodes.length;

			if (excludeBr && tagName === 'br') {
				return true;
			}

			if ($(node).hasClass('sceditor-ignore')) {
				return true;
			}

			if (!dom.canHaveChildren(node)) {
				return false;
			}

			// \S|\u00A0 = any non space char
			if (nodeValue && /\S|\u00A0/.test(nodeValue)) {
				return false;
			}

			while (childrenLength--) {
				if (!isEmpty(childNodes[childrenLength],
					excludeBr && !node.previousSibling && !node.nextSibling)) {
					return false;
				}
			}

			return true;
		};

		/**
		 * Removes any tags that are not white listed or if no
		 * tags are white listed it will remove any tags that
		 * are black listed.
		 *
		 * @param  {Node} rootNode
		 * @return {Void}
		 * @private
		 */
		removeTags = function (rootNode) {
			dom.traverse(rootNode, function (node) {
				var	remove,
					tagName         = node.nodeName.toLowerCase(),
					parentNode      = node.parentNode,
					nodeType        = node.nodeType,
					isBlock         = !dom.isInline(node),
					previousSibling = node.previousSibling,
					nextSibling     = node.nextSibling,
					isTopLevel      = parentNode === rootNode,
					noSiblings      = !previousSibling && !nextSibling,
					empty           = tagName !== 'iframe' && isEmpty(node,
						isTopLevel && noSiblings && tagName !== 'br'),
					document        = node.ownerDocument,
					allowedtags     = sceditorPlugins.xhtml.allowedTags,
					disallowedTags  = sceditorPlugins.xhtml.disallowedTags;

				// 3 = text node
				if (nodeType === 3) {
					return;
				}

				if (nodeType === 4) {
					tagName = '!cdata';
				} else if (tagName === '!' || nodeType === 8) {
					tagName = '!comment';
				}

				if (empty) {
					remove = true;
				// 3 is text node which do not get filtered
				} else if (allowedtags && allowedtags.length) {
					remove = ($.inArray(tagName, allowedtags) < 0);
				} else if (disallowedTags && disallowedTags.length) {
					remove = ($.inArray(tagName, disallowedTags) > -1);
				}

				if (remove) {
					if (!empty) {
						if (isBlock && previousSibling &&
							dom.isInline(previousSibling)) {
							parentNode.insertBefore(
								document.createTextNode(' '), node);
						}

						// Insert all the childen after node
						while (node.firstChild) {
							parentNode.insertBefore(node.firstChild,
								nextSibling);
						}

						if (isBlock && nextSibling &&
							dom.isInline(nextSibling)) {
							parentNode.insertBefore(
								document.createTextNode(' '), nextSibling);
						}
					}

					parentNode.removeChild(node);
				}
			}, true);
		};

		/**
		 * Merges two sets of attribute filters into one
		 *
		 * @param  {Object} filtersA
		 * @param  {Object} filtersB
		 * @return {Object}
		 * @private
		 */
		mergeAttribsFilters = function (filtersA, filtersB) {
			var ret = {};

			if (filtersA) {
				$.extend(ret, filtersA);
			}

			if (!filtersB) {
				return ret;
			}

			$.each(filtersB, function (attrName, values) {
				if ($.isArray(values)) {
					ret[attrName] = $.merge(ret[attrName] || [], values);
				} else if (!ret[attrName]) {
					ret[attrName] = null;
				}
			});

			return ret;
		};

		/**
		 * Wraps adjacent inline child nodes of root
		 * in paragraphs.
		 *
		 * @param {Node} root
		 * @private
		 */
		wrapInlines = function (root) {
			var adjacentInlines = [];
			var wrapAdjacents = function () {
				if (adjacentInlines.length) {
					$('<p>', root.ownerDocument)
						.insertBefore(adjacentInlines[0])
						.append(adjacentInlines);

					adjacentInlines = [];
				}
			};

			// Strip empty text nodes so they don't get wrapped.
			dom.removeWhiteSpace(root);

			var node = root.firstChild;
			while (node) {
				if (dom.isInline(node) && !$(node).is('.sceditor-ignore')) {
					adjacentInlines.push(node);
				} else {
					wrapAdjacents();
				}

				node = node.nextSibling;
			}

			wrapAdjacents();
		};

		/**
		 * Removes any attributes that are not white listed or
		 * if no attributes are white listed it will remove
		 * any attributes that are black listed.
		 * @param  {Node} node
		 * @return {Void}
		 * @private
		 */
		removeAttribs = function (node) {
			var	tagName, attr, attrName, attrsLength, validValues, remove,
				allowedAttribs    = sceditorPlugins.xhtml.allowedAttribs,
				isAllowed         = allowedAttribs &&
					!$.isEmptyObject(allowedAttribs),
				disallowedAttribs = sceditorPlugins.xhtml.disallowedAttribs,
				isDisallowed      = disallowedAttribs &&
					!$.isEmptyObject(disallowedAttribs);

			attrsCache = {};

			dom.traverse(node, function (node) {
				if (!node.attributes) {
					return;
				}

				tagName     = node.nodeName.toLowerCase();
				attrsLength = node.attributes.length;

				if (attrsLength) {
					if (!attrsCache[tagName]) {
						if (isAllowed) {
							attrsCache[tagName] = mergeAttribsFilters(
								allowedAttribs['*'],
								allowedAttribs[tagName]
							);
						} else {
							attrsCache[tagName] = mergeAttribsFilters(
								disallowedAttribs['*'],
								disallowedAttribs[tagName]
							);
						}
					}

					while (attrsLength--) {
						attr        = node.attributes[attrsLength];
						attrName    = attr.name;
						validValues = attrsCache[tagName][attrName];
						remove      = false;

						if (isAllowed) {
							remove = validValues !== null &&
								(!$.isArray(validValues) ||
									$.inArray(attr.value, validValues) < 0);
						} else if (isDisallowed) {
							remove = validValues === null ||
								($.isArray(validValues) &&
									$.inArray(attr.value, validValues) > -1);
						}

						if (remove) {
							node.removeAttribute(attrName);
						}
					}
				}
			});
		};
	};

	/**
	 * Tag conveters, a converter is applied to all
	 * tags that match the criteria.
	 * @type {Array}
	 * @name jQuery.sceditor.plugins.xhtml.converters
	 * @since v1.4.1
	 */
	sceditorPlugins.xhtml.converters = [
		{
			tags: {
				'*': {
					width: null
				}
			},
			conv: function (node, $node) {
				$node.css('width', $node.attr('width')).removeAttr('width');
			}
		},
		{
			tags: {
				'*': {
					height: null
				}
			},
			conv: function (node, $node) {
				$node.css('height', $node.attr('height')).removeAttr('height');
			}
		},
		{
			tags: {
				'li': {
					value: null
				}
			},
			conv: function (node, $node) {
				$node.removeAttr('value');
			}
		},
		{
			tags: {
				'*': {
					text: null
				}
			},
			conv: function (node, $node) {
				$node.css('color', $node.attr('text')).removeAttr('text');
			}
		},
		{
			tags: {
				'*': {
					color: null
				}
			},
			conv: function (node, $node) {
				$node.css('color', $node.attr('color')).removeAttr('color');
			}
		},
		{
			tags: {
				'*': {
					face: null
				}
			},
			conv: function (node, $node) {
				$node.css('fontFamily', $node.attr('face')).removeAttr('face');
			}
		},
		{
			tags: {
				'*': {
					align: null
				}
			},
			conv: function (node, $node) {
				$node.css('textAlign', $node.attr('align')).removeAttr('align');
			}
		},
		{
			tags: {
				'*': {
					border: null
				}
			},
			conv: function (node, $node) {
				$node
					.css('borderWidth',$node.attr('border'))
					.removeAttr('border');
			}
		},
		{
			tags: {
				applet: {
					name: null
				},
				img: {
					name: null
				},
				layer: {
					name: null
				},
				map: {
					name: null
				},
				object: {
					name: null
				},
				param: {
					name: null
				}
			},
			conv: function (node, $node) {
				if (!$node.attr('id')) {
					$node.attr('id', $node.attr('name'));
				}

				$node.removeAttr('name');
			}
		},
		{
			tags: {
				'*': {
					vspace: null
				}
			},
			conv: function (node, $node) {
				$node
					.css('marginTop', $node.attr('vspace') - 0)
					.css('marginBottom', $node.attr('vspace') - 0)
					.removeAttr('vspace');
			}
		},
		{
			tags: {
				'*': {
					hspace: null
				}
			},
			conv: function (node, $node) {
				$node
					.css('marginLeft', $node.attr('hspace') - 0)
					.css('marginRight', $node.attr('hspace') - 0)
					.removeAttr('hspace');
			}
		},
		{
			tags: {
				'hr': {
					noshade: null
				}
			},
			conv: function (node, $node) {
				$node.css('borderStyle', 'solid').removeAttr('noshade');
			}
		},
		{
			tags: {
				'*': {
					nowrap: null
				}
			},
			conv: function (node, $node) {
				$node.css('white-space', 'nowrap').removeAttr('nowrap');
			}
		},
		{
			tags: {
				big: null
			},
			conv: function (node) {
				$(this.convertTagTo(node, 'span')).css('fontSize', 'larger');
			}
		},
		{
			tags: {
				small: null
			},
			conv: function (node) {
				$(this.convertTagTo(node, 'span')).css('fontSize', 'smaller');
			}
		},
		{
			tags: {
				b: null
			},
			conv: function (node) {
				$(this.convertTagTo(node, 'strong'));
			}
		},
		{
			tags: {
				u: null
			},
			conv: function (node) {
				$(this.convertTagTo(node, 'span'))
					.css('textDecoration', 'underline');
			}
		},
		{
			tags: {
				s: null,
				strike: null
			},
			conv: function (node) {
				$(this.convertTagTo(node, 'span'))
					.css('textDecoration', 'line-through');
			}
		},
		{
			tags: {
				dir: null
			},
			conv: function (node) {
				this.convertTagTo(node, 'ul');
			}
		},
		{
			tags: {
				center: null
			},
			conv: function (node) {
				$(this.convertTagTo(node, 'div'))
					.css('textAlign', 'center');
			}
		},
		{
			tags: {
				font: {
					size: null
				}
			},
			conv: function (node, $node) {
				var	size     = $node.css('fontSize'),
					fontSize = size;

				// IE < 8 sets a font tag with no size to +0 so
				// should just skip it.
				if (fontSize !== '+0') {
					$node.css('fontSize', fontSize);
				}

				$node.removeAttr('size');
			}
		},
		{
			tags: {
				font: null
			},
			conv: function (node) {
				// All it's attributes will be converted
				// by the attribute converters
				this.convertTagTo(node, 'span');
			}
		},
		{
			tags: {
				'*': {
					type: ['_moz']
				}
			},
			conv: function (node, $node) {
				$node.removeAttr('type');
			}
		},
		{
			tags: {
				'*': {
					'_moz_dirty': null
				}
			},
			conv: function (node, $node) {
				$node.removeAttr('_moz_dirty');
			}
		},
		{
			tags: {
				'*': {
					'_moz_editor_bogus_node': null
				}
			},
			conv: function (node, $node) {
				$node.remove();
			}
		}
	];

	/**
	 * Allowed attributes map.
	 *
	 * To allow an attribute for all tags use * as the tag name.
	 *
	 * Leave empty or null to allow all attributes. (the disallow
	 * list will be used to filter them instead)
	 * @type {Object}
	 * @name jQuery.sceditor.plugins.xhtml.allowedAttribs
	 * @since v1.4.1
	 */
	sceditorPlugins.xhtml.allowedAttribs = {};

	/**
	 * Attributes that are not allowed.
	 *
	 * Only used if allowed attributes is null or empty.
	 * @type {Object}
	 * @name jQuery.sceditor.plugins.xhtml.disallowedAttribs
	 * @since v1.4.1
	 */
	sceditorPlugins.xhtml.disallowedAttribs = {};

	/**
	 * Array containing all the allowed tags.
	 *
	 * If null or empty all tags will be allowed.
	 * @type {Array}
	 * @name jQuery.sceditor.plugins.xhtml.allowedTags
	 * @since v1.4.1
	 */
	sceditorPlugins.xhtml.allowedTags = [];

	/**
	 * Array containing all the disallowed tags.
	 *
	 * Only used if allowed tags is null or empty.
	 * @type {Array}
	 * @name jQuery.sceditor.plugins.xhtml.disallowedTags
	 * @since v1.4.1
	 */
	sceditorPlugins.xhtml.disallowedTags = [];
}(jQuery));
