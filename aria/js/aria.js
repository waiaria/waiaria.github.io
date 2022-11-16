/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   Simple accordion pattern example
 */

"use strict";

class Accordion {
	constructor(domNode) {
		this.rootEl = domNode;
		this.buttonEl = this.rootEl.querySelector("button[aria-expanded]");

		const controlsId = this.buttonEl.getAttribute("aria-controls");
		this.contentEl = document.getElementById(controlsId);

		this.open = this.buttonEl.getAttribute("aria-expanded") === "true";

		// add event listeners
		this.buttonEl.addEventListener("click", this.onButtonClick.bind(this));
	}

	onButtonClick() {
		this.toggle(!this.open);
	}

	toggle(open) {
		// don't do anything if the open state doesn't change
		if (open === this.open) {
			return;
		}

		// update the internal state
		this.open = open;

		// handle DOM updates
		this.buttonEl.setAttribute("aria-expanded", `${open}`);
		if (open) {
			this.contentEl.removeAttribute("hidden");
		} else {
			this.contentEl.setAttribute("hidden", "");
		}
	}

	// Add public open and close methods for convenience
	open() {
		this.toggle(true);
	}

	close() {
		this.toggle(false);
	}
}

// init accordions
const accordions = document.querySelectorAll(".accordion h3");
accordions.forEach((accordionEl) => {
	new Accordion(accordionEl);
});

// alert

window.addEventListener("load", function () {
	var button = document.getElementById("alert-trigger");
	button.addEventListener("click", addAlert);
});

/*
 * @function addAlert
 * @desc Adds an alert to the page
 * @param   {object}  event  -  Standard W3C event object
 *
 */
function addAlert() {
	var example = document.getElementById("example");
	var template = document.getElementById("alert-template").innerHTML;
	example.innerHTML = template;
}

/* global closeDialog, openDialog */

var aria = aria || {};
aria.Utils = aria.Utils || {};
aria.Utils.disableCtrl = function (ctrl) {
	ctrl.setAttribute("aria-disabled", "true");
};

aria.Utils.enableCtrl = function (ctrl) {
	ctrl.removeAttribute("aria-disabled");
};

aria.Utils.setLoading = function (saveBtn, saveStatusView) {
	saveBtn.classList.add("loading");
	this.disableCtrl(saveBtn);

	// use a timeout for the loading message
	// if the saved state happens very quickly,
	// we don't need to explicitly announce the intermediate loading state
	const loadingTimeout = window.setTimeout(() => {
		saveStatusView.textContent = "Loading";
	}, 200);

	// set timeout for saved state, to mimic loading
	const fakeLoadingTimeout = Math.random() * 2000;
	window.setTimeout(() => {
		saveBtn.classList.remove("loading");
		saveBtn.classList.add("saved");

		window.clearTimeout(loadingTimeout);
		saveStatusView.textContent = "Saved successfully";
	}, fakeLoadingTimeout);
};

aria.Notes = function Notes(
	notesId,
	saveId,
	saveStatusId,
	discardId,
	localStorageKey
) {
	this.notesInput = document.getElementById(notesId);
	this.saveBtn = document.getElementById(saveId);
	this.saveStatusView = document.getElementById(saveStatusId);
	this.discardBtn = document.getElementById(discardId);
	this.localStorageKey = localStorageKey || "alertdialog-notes";
	this.initialized = false;

	Object.defineProperty(this, "controls", {
		get: function () {
			return document.querySelectorAll(
				"[data-textbox=" + this.notesInput.id + "]"
			);
		},
	});
	Object.defineProperty(this, "hasContent", {
		get: function () {
			return this.notesInput.value.length > 0;
		},
	});
	Object.defineProperty(this, "savedValue", {
		get: function () {
			return JSON.parse(localStorage.getItem(this.localStorageKey));
		},
		set: function (val) {
			this.save(val);
		},
	});
	Object.defineProperty(this, "isCurrent", {
		get: function () {
			return this.notesInput.value === this.savedValue;
		},
	});
	Object.defineProperty(this, "oninput", {
		get: function () {
			return this.notesInput.oninput;
		},
		set: function (fn) {
			if (typeof fn !== "function") {
				throw new TypeError("oninput must be a function");
			}
			this.notesInput.addEventListener("input", fn);
		},
	});

	if (this.saveBtn && this.discardBtn) {
		this.init();
	}
};

aria.Notes.prototype.save = function (val) {
	const isDisabled = this.saveBtn.getAttribute("aria-disabled") === "true";
	if (isDisabled) {
		return;
	}
	localStorage.setItem(
		this.localStorageKey,
		JSON.stringify(val || this.notesInput.value)
	);
	aria.Utils.disableCtrl(this.saveBtn);
	aria.Utils.setLoading(this.saveBtn, this.saveStatusView);
};

aria.Notes.prototype.loadSaved = function () {
	if (this.savedValue) {
		this.notesInput.value = this.savedValue;
	}
};

aria.Notes.prototype.restoreSaveBtn = function () {
	this.saveBtn.classList.remove("loading");
	this.saveBtn.classList.remove("saved");
	this.saveBtn.removeAttribute("aria-disabled");

	this.saveStatusView.textContent = "";
};

aria.Notes.prototype.discard = function () {
	localStorage.clear();
	this.notesInput.value = "";
	this.toggleControls();
	this.restoreSaveBtn();
};

aria.Notes.prototype.disableControls = function () {
	this.controls.forEach(aria.Utils.disableCtrl);
};

aria.Notes.prototype.enableControls = function () {
	this.controls.forEach(aria.Utils.enableCtrl);
};

aria.Notes.prototype.toggleControls = function () {
	if (this.hasContent) {
		this.enableControls();
	} else {
		this.disableControls();
	}
};

aria.Notes.prototype.toggleCurrent = function () {
	if (!this.isCurrent) {
		this.notesInput.classList.remove("can-save");
		aria.Utils.enableCtrl(this.saveBtn);
		this.restoreSaveBtn();
	} else {
		this.notesInput.classList.add("can-save");
		aria.Utils.disableCtrl(this.saveBtn);
	}
};

aria.Notes.prototype.keydownHandler = function (e) {
	var mod = navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey;
	if ((e.key === "s") & mod) {
		e.preventDefault();
		this.save();
	}
};

aria.Notes.prototype.init = function () {
	if (!this.initialized) {
		this.loadSaved();
		this.toggleCurrent();
		this.saveBtn.addEventListener("click", this.save.bind(this, undefined));
		this.discardBtn.addEventListener("click", this.discard.bind(this));
		this.notesInput.addEventListener("input", this.toggleControls.bind(this));
		this.notesInput.addEventListener("input", this.toggleCurrent.bind(this));
		this.notesInput.addEventListener("keydown", this.keydownHandler.bind(this));
		this.initialized = true;
	}
};

/** initialization */
document.addEventListener("DOMContentLoaded", function initAlertDialog() {
	var notes = new aria.Notes(
		"notes",
		"notes_save",
		"notes_save_status",
		"notes_confirm"
	);

	window.discardInput = function (closeBtn) {
		notes.discard.call(notes);
		closeDialog(closeBtn);
	};

	window.openAlertDialog = function (dialogId, triggerBtn, focusFirst) {
		// do not proceed if the trigger button is disabled
		if (triggerBtn.getAttribute("aria-disabled") === "true") {
			return;
		}

		var target = document.getElementById(
			triggerBtn.getAttribute("data-textbox")
		);
		var dialog = document.getElementById(dialogId);
		var desc = document.getElementById(dialog.getAttribute("aria-describedby"));
		var wordCount = document.getElementById("word_count");
		if (!wordCount) {
			wordCount = document.createElement("p");
			wordCount.id = "word_count";
			desc.appendChild(wordCount);
		}
		var count = target.value.split(/\s/).length;
		var frag = count > 1 ? "words" : "word";
		wordCount.textContent = count + " " + frag + " will be deleted.";
		openDialog(dialogId, target, focusFirst);
	};
});
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
(function () {
	/*
	 * When util functions move focus around, set this true so the focus listener
	 * can ignore the events.
	 */
	aria.Utils.IgnoreUtilFocusChanges = false;

	aria.Utils.dialogOpenClass = "has-dialog";

	/**
	 * @description Set focus on descendant nodes until the first focusable element is
	 *       found.
	 * @param element
	 *          DOM node for which to find the first focusable descendant.
	 * @returns {boolean}
	 *  true if a focusable element is found and focus is set.
	 */
	aria.Utils.focusFirstDescendant = function (element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (
				aria.Utils.attemptFocus(child) ||
				aria.Utils.focusFirstDescendant(child)
			) {
				return true;
			}
		}
		return false;
	}; // end focusFirstDescendant

	/**
	 * @description Find the last descendant node that is focusable.
	 * @param element
	 *          DOM node for which to find the last focusable descendant.
	 * @returns {boolean}
	 *  true if a focusable element is found and focus is set.
	 */
	aria.Utils.focusLastDescendant = function (element) {
		for (var i = element.childNodes.length - 1; i >= 0; i--) {
			var child = element.childNodes[i];
			if (
				aria.Utils.attemptFocus(child) ||
				aria.Utils.focusLastDescendant(child)
			) {
				return true;
			}
		}
		return false;
	}; // end focusLastDescendant

	/**
	 * @description Set Attempt to set focus on the current node.
	 * @param element
	 *          The node to attempt to focus on.
	 * @returns {boolean}
	 *  true if element is focused.
	 */
	aria.Utils.attemptFocus = function (element) {
		if (!aria.Utils.isFocusable(element)) {
			return false;
		}

		aria.Utils.IgnoreUtilFocusChanges = true;
		try {
			element.focus();
		} catch (e) {
			// continue regardless of error
		}
		aria.Utils.IgnoreUtilFocusChanges = false;
		return document.activeElement === element;
	}; // end attemptFocus

	/* Modals can open modals. Keep track of them with this array. */
	aria.OpenDialogList = aria.OpenDialogList || new Array(0);

	/**
	 * @returns {object} the last opened dialog (the current dialog)
	 */
	aria.getCurrentDialog = function () {
		if (aria.OpenDialogList && aria.OpenDialogList.length) {
			return aria.OpenDialogList[aria.OpenDialogList.length - 1];
		}
	};

	aria.closeCurrentDialog = function () {
		var currentDialog = aria.getCurrentDialog();
		if (currentDialog) {
			currentDialog.close();
			return true;
		}

		return false;
	};

	aria.handleEscape = function (event) {
		var key = event.which || event.keyCode;

		if (key === aria.KeyCode.ESC && aria.closeCurrentDialog()) {
			event.stopPropagation();
		}
	};

	document.addEventListener("keyup", aria.handleEscape);

	/**
	 * @class
	 * @description Dialog object providing modal focus management.
	 *
	 * Assumptions: The element serving as the dialog container is present in the
	 * DOM and hidden. The dialog container has role='dialog'.
	 * @param dialogId
	 *          The ID of the element serving as the dialog container.
	 * @param focusAfterClosed
	 *          Either the DOM node or the ID of the DOM node to focus when the
	 *          dialog closes.
	 * @param focusFirst
	 *          Optional parameter containing either the DOM node or the ID of the
	 *          DOM node to focus when the dialog opens. If not specified, the
	 *          first focusable element in the dialog will receive focus.
	 */
	aria.Dialog = function (dialogId, focusAfterClosed, focusFirst) {
		this.dialogNode = document.getElementById(dialogId);
		if (this.dialogNode === null) {
			throw new Error('No element found with id="' + dialogId + '".');
		}

		var validRoles = ["dialog", "alertdialog"];
		var isDialog = (this.dialogNode.getAttribute("role") || "")
			.trim()
			.split(/\s+/g)
			.some(function (token) {
				return validRoles.some(function (role) {
					return token === role;
				});
			});
		if (!isDialog) {
			throw new Error(
				"Dialog() requires a DOM element with ARIA role of dialog or alertdialog."
			);
		}

		// Wrap in an individual backdrop element if one doesn't exist
		// Native <dialog> elements use the ::backdrop pseudo-element, which
		// works similarly.
		var backdropClass = "dialog-backdrop";
		if (this.dialogNode.parentNode.classList.contains(backdropClass)) {
			this.backdropNode = this.dialogNode.parentNode;
		} else {
			this.backdropNode = document.createElement("div");
			this.backdropNode.className = backdropClass;
			this.dialogNode.parentNode.insertBefore(
				this.backdropNode,
				this.dialogNode
			);
			this.backdropNode.appendChild(this.dialogNode);
		}
		this.backdropNode.classList.add("active");

		// Disable scroll on the body element
		document.body.classList.add(aria.Utils.dialogOpenClass);

		if (typeof focusAfterClosed === "string") {
			this.focusAfterClosed = document.getElementById(focusAfterClosed);
		} else if (typeof focusAfterClosed === "object") {
			this.focusAfterClosed = focusAfterClosed;
		} else {
			throw new Error(
				"the focusAfterClosed parameter is required for the aria.Dialog constructor."
			);
		}

		if (typeof focusFirst === "string") {
			this.focusFirst = document.getElementById(focusFirst);
		} else if (typeof focusFirst === "object") {
			this.focusFirst = focusFirst;
		} else {
			this.focusFirst = null;
		}

		// Bracket the dialog node with two invisible, focusable nodes.
		// While this dialog is open, we use these to make sure that focus never
		// leaves the document even if dialogNode is the first or last node.
		var preDiv = document.createElement("div");
		this.preNode = this.dialogNode.parentNode.insertBefore(
			preDiv,
			this.dialogNode
		);
		this.preNode.tabIndex = 0;
		var postDiv = document.createElement("div");
		this.postNode = this.dialogNode.parentNode.insertBefore(
			postDiv,
			this.dialogNode.nextSibling
		);
		this.postNode.tabIndex = 0;

		// If this modal is opening on top of one that is already open,
		// get rid of the document focus listener of the open dialog.
		if (aria.OpenDialogList.length > 0) {
			aria.getCurrentDialog().removeListeners();
		}

		this.addListeners();
		aria.OpenDialogList.push(this);
		this.clearDialog();
		this.dialogNode.className = "default_dialog"; // make visible

		if (this.focusFirst) {
			this.focusFirst.focus();
		} else {
			aria.Utils.focusFirstDescendant(this.dialogNode);
		}

		this.lastFocus = document.activeElement;
	}; // end Dialog constructor

	aria.Dialog.prototype.clearDialog = function () {
		Array.prototype.map.call(
			this.dialogNode.querySelectorAll("input"),
			function (input) {
				input.value = "";
			}
		);
	};

	/**
	 * @description
	 *  Hides the current top dialog,
	 *  removes listeners of the top dialog,
	 *  restore listeners of a parent dialog if one was open under the one that just closed,
	 *  and sets focus on the element specified for focusAfterClosed.
	 */
	aria.Dialog.prototype.close = function () {
		aria.OpenDialogList.pop();
		this.removeListeners();
		aria.Utils.remove(this.preNode);
		aria.Utils.remove(this.postNode);
		this.dialogNode.className = "hidden";
		this.backdropNode.classList.remove("active");
		this.focusAfterClosed.focus();

		// If a dialog was open underneath this one, restore its listeners.
		if (aria.OpenDialogList.length > 0) {
			aria.getCurrentDialog().addListeners();
		} else {
			document.body.classList.remove(aria.Utils.dialogOpenClass);
		}
	}; // end close

	/**
	 * @description
	 *  Hides the current dialog and replaces it with another.
	 * @param newDialogId
	 *  ID of the dialog that will replace the currently open top dialog.
	 * @param newFocusAfterClosed
	 *  Optional ID or DOM node specifying where to place focus when the new dialog closes.
	 *  If not specified, focus will be placed on the element specified by the dialog being replaced.
	 * @param newFocusFirst
	 *  Optional ID or DOM node specifying where to place focus in the new dialog when it opens.
	 *  If not specified, the first focusable element will receive focus.
	 */
	aria.Dialog.prototype.replace = function (
		newDialogId,
		newFocusAfterClosed,
		newFocusFirst
	) {
		aria.OpenDialogList.pop();
		this.removeListeners();
		aria.Utils.remove(this.preNode);
		aria.Utils.remove(this.postNode);
		this.dialogNode.className = "hidden";
		this.backdropNode.classList.remove("active");

		var focusAfterClosed = newFocusAfterClosed || this.focusAfterClosed;
		new aria.Dialog(newDialogId, focusAfterClosed, newFocusFirst);
	}; // end replace

	aria.Dialog.prototype.addListeners = function () {
		document.addEventListener("focus", this.trapFocus, true);
	}; // end addListeners

	aria.Dialog.prototype.removeListeners = function () {
		document.removeEventListener("focus", this.trapFocus, true);
	}; // end removeListeners

	aria.Dialog.prototype.trapFocus = function (event) {
		if (aria.Utils.IgnoreUtilFocusChanges) {
			return;
		}
		var currentDialog = aria.getCurrentDialog();
		if (currentDialog.dialogNode.contains(event.target)) {
			currentDialog.lastFocus = event.target;
		} else {
			aria.Utils.focusFirstDescendant(currentDialog.dialogNode);
			if (currentDialog.lastFocus == document.activeElement) {
				aria.Utils.focusLastDescendant(currentDialog.dialogNode);
			}
			currentDialog.lastFocus = document.activeElement;
		}
	}; // end trapFocus

	window.openDialog = function (dialogId, focusAfterClosed, focusFirst) {
		new aria.Dialog(dialogId, focusAfterClosed, focusFirst);
	};

	window.closeDialog = function (closeButton) {
		var topDialog = aria.getCurrentDialog();
		if (topDialog.dialogNode.contains(closeButton)) {
			topDialog.close();
		}
	}; // end closeDialog

	window.replaceDialog = function (
		newDialogId,
		newFocusAfterClosed,
		newFocusFirst
	) {
		var topDialog = aria.getCurrentDialog();
		if (topDialog.dialogNode.contains(document.activeElement)) {
			topDialog.replace(newDialogId, newFocusAfterClosed, newFocusFirst);
		}
	}; // end replaceDialog
})();

("use strict");
/**
 * @namespace aria
 */

/**
 * @description
 *  Key code constants
 */
aria.KeyCode = {
	BACKSPACE: 8,
	TAB: 9,
	RETURN: 13,
	SHIFT: 16,
	ESC: 27,
	SPACE: 32,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
aria.Utils.matches = function (element, selector) {
	if (!Element.prototype.matches) {
		Element.prototype.matches =
			Element.prototype.matchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.oMatchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			function (s) {
				var matches = element.parentNode.querySelectorAll(s);
				var i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {
					// empty
				}
				return i > -1;
			};
	}

	return element.matches(selector);
};

aria.Utils.remove = function (item) {
	if (item.remove && typeof item.remove === "function") {
		return item.remove();
	}
	if (
		item.parentNode &&
		item.parentNode.removeChild &&
		typeof item.parentNode.removeChild === "function"
	) {
		return item.parentNode.removeChild(item);
	}
	return false;
};

aria.Utils.isFocusable = function (element) {
	if (element.tabIndex < 0) {
		return false;
	}

	if (element.disabled) {
		return false;
	}

	switch (element.nodeName) {
		case "A":
			return !!element.href && element.rel != "ignore";
		case "INPUT":
			return element.type != "hidden";
		case "BUTTON":
		case "SELECT":
		case "TEXTAREA":
			return true;
		default:
			return false;
	}
};

aria.Utils.getAncestorBySelector = function (element, selector) {
	if (!aria.Utils.matches(element, selector + " " + element.tagName)) {
		// Element is not inside an element that matches selector
		return null;
	}

	// Move up the DOM tree until a parent matching the selector is found
	var currentNode = element;
	var ancestor = null;
	while (ancestor === null) {
		if (aria.Utils.matches(currentNode.parentNode, selector)) {
			ancestor = currentNode.parentNode;
		} else {
			currentNode = currentNode.parentNode;
		}
	}

	return ancestor;
};

aria.Utils.hasClass = function (element, className) {
	return new RegExp("(\\s|^)" + className + "(\\s|$)").test(element.className);
};

aria.Utils.addClass = function (element, className) {
	if (!aria.Utils.hasClass(element, className)) {
		element.className += " " + className;
	}
};

aria.Utils.removeClass = function (element, className) {
	var classRegex = new RegExp("(\\s|^)" + className + "(\\s|$)");
	element.className = element.className.replace(classRegex, " ").trim();
};

aria.Utils.bindMethods = function (object /* , ...methodNames */) {
	var methodNames = Array.prototype.slice.call(arguments, 1);
	methodNames.forEach(function (method) {
		object[method] = object[method].bind(object);
	});
};

// Button
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   JS code for the button design pattern
 */

var ICON_MUTE_URL = "#icon-mute";
var ICON_SOUND_URL = "#icon-sound";
function init() {
	var actionButton = document.getElementById("action");
	actionButton.addEventListener("click", activateActionButton);
	actionButton.addEventListener("keydown", actionButtonKeydownHandler);
	actionButton.addEventListener("keyup", actionButtonKeyupHandler);

	var toggleButton = document.getElementById("toggle");
	toggleButton.addEventListener("click", toggleButtonClickHandler);
	toggleButton.addEventListener("keydown", toggleButtonKeydownHandler);
	toggleButton.addEventListener("keyup", toggleButtonKeyupHandler);
}

/**
 * Activates the action button with the enter key.
 *
 * @param {KeyboardEvent} event
 */
function actionButtonKeydownHandler(event) {
	// The action button is activated by space on the keyup event, but the
	// default action for space is already triggered on keydown. It needs to be
	// prevented to stop scrolling the page before activating the button.
	if (event.keyCode === 32) {
		event.preventDefault();
	}
	// If enter is pressed, activate the button
	else if (event.keyCode === 13) {
		event.preventDefault();
		activateActionButton();
	}
}

/**
 * Activates the action button with the space key.
 *
 * @param {KeyboardEvent} event
 */
function actionButtonKeyupHandler(event) {
	if (event.keyCode === 32) {
		event.preventDefault();
		activateActionButton();
	}
}

function activateActionButton() {
	window.print();
}

/**
 * Toggles the toggle button’s state if it’s actually a button element or has
 * the `role` attribute set to `button`.
 *
 * @param {MouseEvent} event
 */
function toggleButtonClickHandler(event) {
	if (
		event.currentTarget.tagName === "button" ||
		event.currentTarget.getAttribute("role") === "button"
	) {
		toggleButtonState(event.currentTarget);
	}
}

/**
 * Toggles the toggle button’s state with the enter key.
 *
 * @param {KeyboardEvent} event
 */
function toggleButtonKeydownHandler(event) {
	if (event.keyCode === 32) {
		event.preventDefault();
	} else if (event.keyCode === 13) {
		event.preventDefault();
		toggleButtonState(event.currentTarget);
	}
}

/**
 * Toggles the toggle button’s state with space key.
 *
 * @param {KeyboardEvent} event
 */
function toggleButtonKeyupHandler(event) {
	if (event.keyCode === 32) {
		event.preventDefault();
		toggleButtonState(event.currentTarget);
	}
}

/**
 * Toggles the toggle button’s state between *pressed* and *not pressed*.
 *
 * @param {HTMLElement} button
 */
function toggleButtonState(button) {
	var isAriaPressed = button.getAttribute("aria-pressed") === "true";

	button.setAttribute("aria-pressed", isAriaPressed ? "false" : "true");

	var icon = button.querySelector("use");
	icon.setAttribute(
		"xlink:href",
		isAriaPressed ? ICON_SOUND_URL : ICON_MUTE_URL
	);
}

window.onload = init;

// Menu Button Links

class MenuButtonLinks {
	constructor(domNode) {
		this.domNode = domNode;
		this.buttonNode = domNode.querySelector("button");
		this.menuNode = domNode.querySelector('[role="menu"]');
		this.menuitemNodes = [];
		this.firstMenuitem = false;
		this.lastMenuitem = false;
		this.firstChars = [];

		this.buttonNode.addEventListener(
			"keydown",
			this.onButtonKeydown.bind(this)
		);
		this.buttonNode.addEventListener("click", this.onButtonClick.bind(this));

		var nodes = domNode.querySelectorAll('[role="menuitem"]');

		for (var i = 0; i < nodes.length; i++) {
			var menuitem = nodes[i];
			this.menuitemNodes.push(menuitem);
			menuitem.tabIndex = -1;
			this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase());

			menuitem.addEventListener("keydown", this.onMenuitemKeydown.bind(this));

			menuitem.addEventListener(
				"mouseover",
				this.onMenuitemMouseover.bind(this)
			);

			if (!this.firstMenuitem) {
				this.firstMenuitem = menuitem;
			}
			this.lastMenuitem = menuitem;
		}

		domNode.addEventListener("focusin", this.onFocusin.bind(this));
		domNode.addEventListener("focusout", this.onFocusout.bind(this));

		window.addEventListener(
			"mousedown",
			this.onBackgroundMousedown.bind(this),
			true
		);
	}

	setFocusToMenuitem(newMenuitem) {
		this.menuitemNodes.forEach(function (item) {
			if (item === newMenuitem) {
				item.tabIndex = 0;
				newMenuitem.focus();
			} else {
				item.tabIndex = -1;
			}
		});
	}

	setFocusToFirstMenuitem() {
		this.setFocusToMenuitem(this.firstMenuitem);
	}

	setFocusToLastMenuitem() {
		this.setFocusToMenuitem(this.lastMenuitem);
	}

	setFocusToPreviousMenuitem(currentMenuitem) {
		var newMenuitem, index;

		if (currentMenuitem === this.firstMenuitem) {
			newMenuitem = this.lastMenuitem;
		} else {
			index = this.menuitemNodes.indexOf(currentMenuitem);
			newMenuitem = this.menuitemNodes[index - 1];
		}

		this.setFocusToMenuitem(newMenuitem);

		return newMenuitem;
	}

	setFocusToNextMenuitem(currentMenuitem) {
		var newMenuitem, index;

		if (currentMenuitem === this.lastMenuitem) {
			newMenuitem = this.firstMenuitem;
		} else {
			index = this.menuitemNodes.indexOf(currentMenuitem);
			newMenuitem = this.menuitemNodes[index + 1];
		}
		this.setFocusToMenuitem(newMenuitem);

		return newMenuitem;
	}

	setFocusByFirstCharacter(currentMenuitem, char) {
		var start, index;

		if (char.length > 1) {
			return;
		}

		char = char.toLowerCase();

		// Get start index for search based on position of currentItem
		start = this.menuitemNodes.indexOf(currentMenuitem) + 1;
		if (start >= this.menuitemNodes.length) {
			start = 0;
		}

		// Check remaining slots in the menu
		index = this.firstChars.indexOf(char, start);

		// If not found in remaining slots, check from beginning
		if (index === -1) {
			index = this.firstChars.indexOf(char, 0);
		}

		// If match was found...
		if (index > -1) {
			this.setFocusToMenuitem(this.menuitemNodes[index]);
		}
	}

	// Utilities

	getIndexFirstChars(startIndex, char) {
		for (var i = startIndex; i < this.firstChars.length; i++) {
			if (char === this.firstChars[i]) {
				return i;
			}
		}
		return -1;
	}

	// Popup menu methods

	openPopup() {
		this.menuNode.style.display = "block";
		this.buttonNode.setAttribute("aria-expanded", "true");
	}

	closePopup() {
		if (this.isOpen()) {
			this.buttonNode.removeAttribute("aria-expanded");
			this.menuNode.style.display = "none";
		}
	}

	isOpen() {
		return this.buttonNode.getAttribute("aria-expanded") === "true";
	}

	// Menu event handlers

	onFocusin() {
		this.domNode.classList.add("focus");
	}

	onFocusout() {
		this.domNode.classList.remove("focus");
	}

	onButtonKeydown(event) {
		var key = event.key,
			flag = false;

		switch (key) {
			case " ":
			case "Enter":
			case "ArrowDown":
			case "Down":
				this.openPopup();
				this.setFocusToFirstMenuitem();
				flag = true;
				break;

			case "Esc":
			case "Escape":
				this.closePopup();
				this.buttonNode.focus();
				flag = true;
				break;

			case "Up":
			case "ArrowUp":
				this.openPopup();
				this.setFocusToLastMenuitem();
				flag = true;
				break;

			default:
				break;
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onButtonClick(event) {
		if (this.isOpen()) {
			this.closePopup();
			this.buttonNode.focus();
		} else {
			this.openPopup();
			this.setFocusToFirstMenuitem();
		}

		event.stopPropagation();
		event.preventDefault();
	}

	onMenuitemKeydown(event) {
		var tgt = event.currentTarget,
			key = event.key,
			flag = false;

		function isPrintableCharacter(str) {
			return str.length === 1 && str.match(/\S/);
		}

		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}

		if (event.shiftKey) {
			if (isPrintableCharacter(key)) {
				this.setFocusByFirstCharacter(tgt, key);
				flag = true;
			}

			if (event.key === "Tab") {
				this.buttonNode.focus();
				this.closePopup();
				flag = true;
			}
		} else {
			switch (key) {
				case " ":
					window.location.href = tgt.href;
					break;

				case "Esc":
				case "Escape":
					this.closePopup();
					this.buttonNode.focus();
					flag = true;
					break;

				case "Up":
				case "ArrowUp":
					this.setFocusToPreviousMenuitem(tgt);
					flag = true;
					break;

				case "ArrowDown":
				case "Down":
					this.setFocusToNextMenuitem(tgt);
					flag = true;
					break;

				case "Home":
				case "PageUp":
					this.setFocusToFirstMenuitem();
					flag = true;
					break;

				case "End":
				case "PageDown":
					this.setFocusToLastMenuitem();
					flag = true;
					break;

				case "Tab":
					this.closePopup();
					break;

				default:
					if (isPrintableCharacter(key)) {
						this.setFocusByFirstCharacter(tgt, key);
						flag = true;
					}
					break;
			}
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onMenuitemMouseover(event) {
		var tgt = event.currentTarget;
		tgt.focus();
	}

	onBackgroundMousedown(event) {
		if (!this.domNode.contains(event.target)) {
			if (this.isOpen()) {
				this.closePopup();
				this.buttonNode.focus();
			}
		}
	}
}

// Initialize menu buttons
window.addEventListener("load", function () {
	var menuButtons = document.querySelectorAll(".menu-button-links");
	for (let i = 0; i < menuButtons.length; i++) {
		new MenuButtonLinks(menuButtons[i]);
	}
});

/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   menu-button-actions.js
 *
 *   Desc:   Creates a menu button that opens a menu of actions
 */

("use strict");

class MenuButtonActions {
	constructor(domNode, performMenuAction) {
		this.domNode = domNode;
		this.performMenuAction = performMenuAction;
		this.buttonNode = domNode.querySelector("button");
		this.menuNode = domNode.querySelector('[role="menu"]');
		this.menuitemNodes = [];
		this.firstMenuitem = false;
		this.lastMenuitem = false;
		this.firstChars = [];

		this.buttonNode.addEventListener(
			"keydown",
			this.onButtonKeydown.bind(this)
		);
		this.buttonNode.addEventListener("click", this.onButtonClick.bind(this));

		var nodes = domNode.querySelectorAll('[role="menuitem"]');

		for (var i = 0; i < nodes.length; i++) {
			var menuitem = nodes[i];
			this.menuitemNodes.push(menuitem);
			menuitem.tabIndex = -1;
			this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase());

			menuitem.addEventListener("keydown", this.onMenuitemKeydown.bind(this));

			menuitem.addEventListener("click", this.onMenuitemClick.bind(this));

			menuitem.addEventListener(
				"mouseover",
				this.onMenuitemMouseover.bind(this)
			);

			if (!this.firstMenuitem) {
				this.firstMenuitem = menuitem;
			}
			this.lastMenuitem = menuitem;
		}

		domNode.addEventListener("focusin", this.onFocusin.bind(this));
		domNode.addEventListener("focusout", this.onFocusout.bind(this));

		window.addEventListener(
			"mousedown",
			this.onBackgroundMousedown.bind(this),
			true
		);
	}

	setFocusToMenuitem(newMenuitem) {
		this.menuitemNodes.forEach(function (item) {
			if (item === newMenuitem) {
				item.tabIndex = 0;
				newMenuitem.focus();
			} else {
				item.tabIndex = -1;
			}
		});
	}

	setFocusToFirstMenuitem() {
		this.setFocusToMenuitem(this.firstMenuitem);
	}

	setFocusToLastMenuitem() {
		this.setFocusToMenuitem(this.lastMenuitem);
	}

	setFocusToPreviousMenuitem(currentMenuitem) {
		var newMenuitem, index;

		if (currentMenuitem === this.firstMenuitem) {
			newMenuitem = this.lastMenuitem;
		} else {
			index = this.menuitemNodes.indexOf(currentMenuitem);
			newMenuitem = this.menuitemNodes[index - 1];
		}

		this.setFocusToMenuitem(newMenuitem);

		return newMenuitem;
	}

	setFocusToNextMenuitem(currentMenuitem) {
		var newMenuitem, index;

		if (currentMenuitem === this.lastMenuitem) {
			newMenuitem = this.firstMenuitem;
		} else {
			index = this.menuitemNodes.indexOf(currentMenuitem);
			newMenuitem = this.menuitemNodes[index + 1];
		}
		this.setFocusToMenuitem(newMenuitem);

		return newMenuitem;
	}

	setFocusByFirstCharacter(currentMenuitem, char) {
		var start, index;

		if (char.length > 1) {
			return;
		}

		char = char.toLowerCase();

		// Get start index for search based on position of currentItem
		start = this.menuitemNodes.indexOf(currentMenuitem) + 1;
		if (start >= this.menuitemNodes.length) {
			start = 0;
		}

		// Check remaining slots in the menu
		index = this.firstChars.indexOf(char, start);

		// If not found in remaining slots, check from beginning
		if (index === -1) {
			index = this.firstChars.indexOf(char, 0);
		}

		// If match was found...
		if (index > -1) {
			this.setFocusToMenuitem(this.menuitemNodes[index]);
		}
	}

	// Utilities

	getIndexFirstChars(startIndex, char) {
		for (var i = startIndex; i < this.firstChars.length; i++) {
			if (char === this.firstChars[i]) {
				return i;
			}
		}
		return -1;
	}

	// Popup menu methods

	openPopup() {
		this.menuNode.style.display = "block";
		this.buttonNode.setAttribute("aria-expanded", "true");
	}

	closePopup() {
		if (this.isOpen()) {
			this.buttonNode.removeAttribute("aria-expanded");
			this.menuNode.style.display = "none";
		}
	}

	isOpen() {
		return this.buttonNode.getAttribute("aria-expanded") === "true";
	}

	// Menu event handlers

	onFocusin() {
		this.domNode.classList.add("focus");
	}

	onFocusout() {
		this.domNode.classList.remove("focus");
	}

	onButtonKeydown(event) {
		var key = event.key,
			flag = false;

		switch (key) {
			case " ":
			case "Enter":
			case "ArrowDown":
			case "Down":
				this.openPopup();
				this.setFocusToFirstMenuitem();
				flag = true;
				break;

			case "Esc":
			case "Escape":
				this.closePopup();
				flag = true;
				break;

			case "Up":
			case "ArrowUp":
				this.openPopup();
				this.setFocusToLastMenuitem();
				flag = true;
				break;

			default:
				break;
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onButtonClick(event) {
		if (this.isOpen()) {
			this.closePopup();
			this.buttonNode.focus();
		} else {
			this.openPopup();
			this.setFocusToFirstMenuitem();
		}

		event.stopPropagation();
		event.preventDefault();
	}

	onMenuitemKeydown(event) {
		var tgt = event.currentTarget,
			key = event.key,
			flag = false;

		function isPrintableCharacter(str) {
			return str.length === 1 && str.match(/\S/);
		}

		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}

		if (event.shiftKey) {
			if (isPrintableCharacter(key)) {
				this.setFocusByFirstCharacter(tgt, key);
				flag = true;
			}

			if (event.key === "Tab") {
				this.buttonNode.focus();
				this.closePopup();
				flag = true;
			}
		} else {
			switch (key) {
				case " ":
				case "Enter":
					this.closePopup();
					this.performMenuAction(tgt);
					this.buttonNode.focus();
					flag = true;
					break;

				case "Esc":
				case "Escape":
					this.closePopup();
					this.buttonNode.focus();
					flag = true;
					break;

				case "Up":
				case "ArrowUp":
					this.setFocusToPreviousMenuitem(tgt);
					flag = true;
					break;

				case "ArrowDown":
				case "Down":
					this.setFocusToNextMenuitem(tgt);
					flag = true;
					break;

				case "Home":
				case "PageUp":
					this.setFocusToFirstMenuitem();
					flag = true;
					break;

				case "End":
				case "PageDown":
					this.setFocusToLastMenuitem();
					flag = true;
					break;

				case "Tab":
					this.closePopup();
					break;

				default:
					if (isPrintableCharacter(key)) {
						this.setFocusByFirstCharacter(tgt, key);
						flag = true;
					}
					break;
			}
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onMenuitemClick(event) {
		var tgt = event.currentTarget;
		this.closePopup();
		this.buttonNode.focus();
		this.performMenuAction(tgt);
	}

	onMenuitemMouseover(event) {
		var tgt = event.currentTarget;
		tgt.focus();
	}

	onBackgroundMousedown(event) {
		if (!this.domNode.contains(event.target)) {
			if (this.isOpen()) {
				this.closePopup();
				this.buttonNode.focus();
			}
		}
	}
}

// Initialize menu buttons
window.addEventListener("load", function () {
	document.getElementById("action_output").value = "none";

	function performMenuAction(node) {
		document.getElementById("action_output").value = node.textContent.trim();
	}

	var menuButtons = document.querySelectorAll(".menu-button-actions");
	for (var i = 0; i < menuButtons.length; i++) {
		new MenuButtonActions(menuButtons[i], performMenuAction);
	}
});

/*
 *   File:   carousel-prev-next.js
 *
 *   Desc:   Carousel widget with Previous and Next Buttons that implements ARIA Authoring Practices
 *
 */

("use strict");

var CarouselPreviousNext = function (node, options) {
	// merge passed options with defaults
	options = Object.assign(
		{ moreaccessible: false, paused: false, norotate: false },
		options || {}
	);

	// a prefers-reduced-motion user setting must always override autoplay
	var hasReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	if (hasReducedMotion.matches) {
		options.paused = true;
	}

	/* DOM properties */
	this.domNode = node;

	this.carouselItemNodes = node.querySelectorAll(".carousel-item");

	this.containerNode = node.querySelector(".carousel-items");
	this.liveRegionNode = node.querySelector(".carousel-items");
	this.pausePlayButtonNode = null;
	this.previousButtonNode = null;
	this.nextButtonNode = null;

	this.playLabel = "Start automatic slide show";
	this.pauseLabel = "Stop automatic slide show";

	/* State properties */
	this.hasUserActivatedPlay = false; // set when the user activates the play/pause button
	this.isAutoRotationDisabled = options.norotate; // This property for disabling auto rotation
	this.isPlayingEnabled = !options.paused; // This property is also set in updatePlaying method
	this.timeInterval = 5000; // length of slide rotation in ms
	this.currentIndex = 0; // index of current slide
	this.slideTimeout = null; // save reference to setTimeout

	// Pause Button

	var elem = document.querySelector(".carousel .controls button.rotation");
	if (elem) {
		this.pausePlayButtonNode = elem;
		this.pausePlayButtonNode.addEventListener(
			"click",
			this.handlePausePlayButtonClick.bind(this)
		);
	}

	// Previous Button

	elem = document.querySelector(".carousel .controls button.previous");
	if (elem) {
		this.previousButtonNode = elem;
		this.previousButtonNode.addEventListener(
			"click",
			this.handlePreviousButtonClick.bind(this)
		);
		this.previousButtonNode.addEventListener(
			"focus",
			this.handleFocusIn.bind(this)
		);
		this.previousButtonNode.addEventListener(
			"blur",
			this.handleFocusOut.bind(this)
		);
	}

	// Next Button

	elem = document.querySelector(".carousel .controls button.next");
	if (elem) {
		this.nextButtonNode = elem;
		this.nextButtonNode.addEventListener(
			"click",
			this.handleNextButtonClick.bind(this)
		);
		this.nextButtonNode.addEventListener(
			"focus",
			this.handleFocusIn.bind(this)
		);
		this.nextButtonNode.addEventListener(
			"blur",
			this.handleFocusOut.bind(this)
		);
	}

	// Carousel item events

	for (var i = 0; i < this.carouselItemNodes.length; i++) {
		var carouselItemNode = this.carouselItemNodes[i];

		// support stopping rotation when any element receives focus in the tabpanel
		carouselItemNode.addEventListener("focusin", this.handleFocusIn.bind(this));
		carouselItemNode.addEventListener(
			"focusout",
			this.handleFocusOut.bind(this)
		);

		var imageLinkNode = carouselItemNode.querySelector(".carousel-image a");

		if (imageLinkNode) {
			imageLinkNode.addEventListener(
				"focus",
				this.handleImageLinkFocus.bind(this)
			);
			imageLinkNode.addEventListener(
				"blur",
				this.handleImageLinkBlur.bind(this)
			);
		}
	}

	// Handle hover events
	this.domNode.addEventListener("mouseover", this.handleMouseOver.bind(this));
	this.domNode.addEventListener("mouseout", this.handleMouseOut.bind(this));

	// initialize behavior based on options

	this.enableOrDisableAutoRotation(options.norotate);
	this.updatePlaying(!options.paused && !options.norotate);
	this.setAccessibleStyling(options.moreaccessible);
	this.rotateSlides();
};

/* Public function to disable/enable rotation and if false, hide pause/play button*/
CarouselPreviousNext.prototype.enableOrDisableAutoRotation = function (
	disable
) {
	this.isAutoRotationDisabled = disable;
	this.pausePlayButtonNode.hidden = disable;
};

/* Public function to update controls/caption styling */
CarouselPreviousNext.prototype.setAccessibleStyling = function (accessible) {
	if (accessible) {
		this.domNode.classList.add("carousel-moreaccessible");
	} else {
		this.domNode.classList.remove("carousel-moreaccessible");
	}
};

CarouselPreviousNext.prototype.showCarouselItem = function (index) {
	this.currentIndex = index;

	for (var i = 0; i < this.carouselItemNodes.length; i++) {
		var carouselItemNode = this.carouselItemNodes[i];
		if (index === i) {
			carouselItemNode.classList.add("active");
		} else {
			carouselItemNode.classList.remove("active");
		}
	}
};

CarouselPreviousNext.prototype.previousCarouselItem = function () {
	var nextIndex = this.currentIndex - 1;
	if (nextIndex < 0) {
		nextIndex = this.carouselItemNodes.length - 1;
	}
	this.showCarouselItem(nextIndex);
};

CarouselPreviousNext.prototype.nextCarouselItem = function () {
	var nextIndex = this.currentIndex + 1;
	if (nextIndex >= this.carouselItemNodes.length) {
		nextIndex = 0;
	}
	this.showCarouselItem(nextIndex);
};

CarouselPreviousNext.prototype.rotateSlides = function () {
	if (!this.isAutoRotationDisabled) {
		if (
			(!this.hasFocus && !this.hasHover && this.isPlayingEnabled) ||
			this.hasUserActivatedPlay
		) {
			this.nextCarouselItem();
		}
	}

	this.slideTimeout = setTimeout(
		this.rotateSlides.bind(this),
		this.timeInterval
	);
};

CarouselPreviousNext.prototype.updatePlaying = function (play) {
	this.isPlayingEnabled = play;

	if (play) {
		this.pausePlayButtonNode.setAttribute("aria-label", this.pauseLabel);
		this.pausePlayButtonNode.classList.remove("play");
		this.pausePlayButtonNode.classList.add("pause");
		this.liveRegionNode.setAttribute("aria-live", "off");
	} else {
		this.pausePlayButtonNode.setAttribute("aria-label", this.playLabel);
		this.pausePlayButtonNode.classList.remove("pause");
		this.pausePlayButtonNode.classList.add("play");
		this.liveRegionNode.setAttribute("aria-live", "polite");
	}
};

/* Event Handlers */

CarouselPreviousNext.prototype.handleImageLinkFocus = function () {
	this.liveRegionNode.classList.add("focus");
};

CarouselPreviousNext.prototype.handleImageLinkBlur = function () {
	this.liveRegionNode.classList.remove("focus");
};

CarouselPreviousNext.prototype.handleMouseOver = function (event) {
	if (!this.pausePlayButtonNode.contains(event.target)) {
		this.hasHover = true;
	}
};

CarouselPreviousNext.prototype.handleMouseOut = function () {
	this.hasHover = false;
};

/* EVENT HANDLERS */

CarouselPreviousNext.prototype.handlePausePlayButtonClick = function () {
	this.hasUserActivatedPlay = !this.isPlayingEnabled;
	this.updatePlaying(!this.isPlayingEnabled);
};

CarouselPreviousNext.prototype.handlePreviousButtonClick = function () {
	this.previousCarouselItem();
};

CarouselPreviousNext.prototype.handleNextButtonClick = function () {
	this.nextCarouselItem();
};

/* Event Handlers for carousel items*/

CarouselPreviousNext.prototype.handleFocusIn = function () {
	this.liveRegionNode.setAttribute("aria-live", "polite");
	this.hasFocus = true;
};

CarouselPreviousNext.prototype.handleFocusOut = function () {
	if (this.isPlayingEnabled) {
		this.liveRegionNode.setAttribute("aria-live", "off");
	}
	this.hasFocus = false;
};

/* Initialize Carousel and options */

window.addEventListener(
	"load",
	function () {
		var carouselEls = document.querySelectorAll(".carousel");
		var carousels = [];

		// set example behavior based on
		// default setting of the checkboxes and the parameters in the URL
		// update checkboxes based on any corresponding URL parameters
		var checkboxes = document.querySelectorAll(
			".carousel-options input[type=checkbox]"
		);
		var urlParams = new URLSearchParams(location.search);
		var carouselOptions = {};

		// initialize example features based on
		// default setting of the checkboxes and the parameters in the URL
		// update checkboxes based on any corresponding URL parameters
		checkboxes.forEach(function (checkbox) {
			var checked = checkbox.checked;

			if (urlParams.has(checkbox.value)) {
				var urlParam = urlParams.get(checkbox.value);
				if (typeof urlParam === "string") {
					checked = urlParam === "true";
					checkbox.checked = checked;
				}
			}

			carouselOptions[checkbox.value] = checkbox.checked;
		});

		carouselEls.forEach(function (node) {
			carousels.push(new CarouselPreviousNext(node, carouselOptions));
		});

		// add change event to checkboxes
		checkboxes.forEach(function (checkbox) {
			var updateEvent;
			switch (checkbox.value) {
				case "moreaccessible":
					updateEvent = "setAccessibleStyling";
					break;
				case "norotate":
					updateEvent = "enableOrDisableAutoRotation";
					break;
			}

			// update the carousel behavior and URL when a checkbox state changes
			checkbox.addEventListener("change", function (event) {
				urlParams.set(event.target.value, event.target.checked + "");
				window.history.replaceState(
					null,
					"",
					window.location.pathname + "?" + urlParams
				);

				if (updateEvent) {
					carousels.forEach(function (carousel) {
						carousel[updateEvent](event.target.checked);
					});
				}
			});
		});
	},
	false
);

// Checkbox
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   Checkbox.js
 *
 *   Desc:   Checkbox widget that implements ARIA Authoring Practices
 */

("use strict");

class Checkbox {
	constructor(domNode) {
		this.domNode = domNode;
		this.domNode.tabIndex = 0;

		if (!this.domNode.getAttribute("aria-checked")) {
			this.domNode.setAttribute("aria-checked", "false");
		}

		this.domNode.addEventListener("keydown", this.onKeydown.bind(this));
		this.domNode.addEventListener("click", this.onClick.bind(this));
	}

	toggleCheckbox() {
		if (this.domNode.getAttribute("aria-checked") === "true") {
			this.domNode.setAttribute("aria-checked", "false");
		} else {
			this.domNode.setAttribute("aria-checked", "true");
		}
	}

	/* EVENT HANDLERS */

	onKeydown(event) {
		var flag = false;

		switch (event.key) {
			case " ":
				this.toggleCheckbox();
				flag = true;
				break;

			default:
				break;
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onClick() {
		this.toggleCheckbox();
	}
}

// Initialize checkboxes on the page
window.addEventListener("load", function () {
	let checkboxes = document.querySelectorAll('.checkboxes [role="checkbox"]');
	for (let i = 0; i < checkboxes.length; i++) {
		new Checkbox(checkboxes[i]);
	}
});

// Checkbox Mixed
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   CheckboxMixed.js
 *
 *   Desc:   CheckboxMixed widget that implements ARIA Authoring Practices
 *           for a menu of links
 */

("use strict");

class CheckboxMixed {
	constructor(domNode) {
		this.mixedNode = domNode.querySelector('[role="checkbox"]');
		this.checkboxNodes = domNode.querySelectorAll('input[type="checkbox"]');

		this.mixedNode.addEventListener("keydown", this.onMixedKeydown.bind(this));
		this.mixedNode.addEventListener("click", this.onMixedClick.bind(this));
		this.mixedNode.addEventListener("focus", this.onMixedFocus.bind(this));
		this.mixedNode.addEventListener("blur", this.onMixedBlur.bind(this));

		for (var i = 0; i < this.checkboxNodes.length; i++) {
			var checkboxNode = this.checkboxNodes[i];

			checkboxNode.addEventListener("click", this.onCheckboxClick.bind(this));
			checkboxNode.addEventListener("focus", this.onCheckboxFocus.bind(this));
			checkboxNode.addEventListener("blur", this.onCheckboxBlur.bind(this));
			checkboxNode.setAttribute("data-last-state", checkboxNode.checked);
		}

		this.updateMixed();
	}

	updateMixed() {
		var count = 0;

		for (var i = 0; i < this.checkboxNodes.length; i++) {
			if (this.checkboxNodes[i].checked) {
				count++;
			}
		}

		if (count === 0) {
			this.mixedNode.setAttribute("aria-checked", "false");
		} else {
			if (count === this.checkboxNodes.length) {
				this.mixedNode.setAttribute("aria-checked", "true");
			} else {
				this.mixedNode.setAttribute("aria-checked", "mixed");
				this.updateCheckboxStates();
			}
		}
	}

	updateCheckboxStates() {
		for (var i = 0; i < this.checkboxNodes.length; i++) {
			var checkboxNode = this.checkboxNodes[i];
			checkboxNode.setAttribute("data-last-state", checkboxNode.checked);
		}
	}

	anyLastChecked() {
		var count = 0;

		for (var i = 0; i < this.checkboxNodes.length; i++) {
			if (this.checkboxNodes[i].getAttribute("data-last-state") == "true") {
				count++;
			}
		}

		return count > 0;
	}

	setCheckboxes(value) {
		for (var i = 0; i < this.checkboxNodes.length; i++) {
			var checkboxNode = this.checkboxNodes[i];

			switch (value) {
				case "last":
					checkboxNode.checked =
						checkboxNode.getAttribute("data-last-state") === "true";
					break;

				case "true":
					checkboxNode.checked = true;
					break;

				default:
					checkboxNode.checked = false;
					break;
			}
		}
		this.updateMixed();
	}

	toggleMixed() {
		var state = this.mixedNode.getAttribute("aria-checked");

		if (state === "false") {
			if (this.anyLastChecked()) {
				this.setCheckboxes("last");
			} else {
				this.setCheckboxes("true");
			}
		} else {
			if (state === "mixed") {
				this.setCheckboxes("true");
			} else {
				this.setCheckboxes("false");
			}
		}

		this.updateMixed();
	}

	/* EVENT HANDLERS */

	onMixedKeydown(event) {
		var flag = false;

		switch (event.key) {
			case " ":
				this.toggleMixed();
				flag = true;
				break;

			default:
				break;
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onMixedClick() {
		this.toggleMixed();
	}

	onMixedFocus() {
		this.mixedNode.classList.add("focus");
	}

	onMixedBlur() {
		this.mixedNode.classList.remove("focus");
	}

	onCheckboxClick(event) {
		event.currentTarget.setAttribute(
			"data-last-state",
			event.currentTarget.checked
		);
		this.updateMixed();
	}

	onCheckboxFocus(event) {
		event.currentTarget.parentNode.classList.add("focus");
	}

	onCheckboxBlur(event) {
		event.currentTarget.parentNode.classList.remove("focus");
	}
}

// Initialize mixed checkboxes on the page
window.addEventListener("load", function () {
	let mixed = document.querySelectorAll(".checkbox-mixed");
	for (let i = 0; i < mixed.length; i++) {
		new CheckboxMixed(mixed[i]);
	}
});

// combobox-select-only
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

("use strict");

// Save a list of named combobox actions, for future readability
const SelectActions = {
	Close: 0,
	CloseSelect: 1,
	First: 2,
	Last: 3,
	Next: 4,
	Open: 5,
	PageDown: 6,
	PageUp: 7,
	Previous: 8,
	Select: 9,
	Type: 10,
};

/*
 * Helper functions
 */

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
function filterOptions(options = [], filter, exclude = []) {
	return options.filter((option) => {
		const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
		return matches && exclude.indexOf(option) < 0;
	});
}

// map a key press to an action
function getActionFromKey(event, menuOpen) {
	const { key, altKey, ctrlKey, metaKey } = event;
	const openKeys = ["ArrowDown", "ArrowUp", "Enter", " "]; // all keys that will do the default open action
	// handle opening when closed
	if (!menuOpen && openKeys.includes(key)) {
		return SelectActions.Open;
	}

	// home and end move the selected option when open or closed
	if (key === "Home") {
		return SelectActions.First;
	}
	if (key === "End") {
		return SelectActions.Last;
	}

	// handle typing characters when open or closed
	if (
		key === "Backspace" ||
		key === "Clear" ||
		(key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey)
	) {
		return SelectActions.Type;
	}

	// handle keys when open
	if (menuOpen) {
		if (key === "ArrowUp" && altKey) {
			return SelectActions.CloseSelect;
		} else if (key === "ArrowDown" && !altKey) {
			return SelectActions.Next;
		} else if (key === "ArrowUp") {
			return SelectActions.Previous;
		} else if (key === "PageUp") {
			return SelectActions.PageUp;
		} else if (key === "PageDown") {
			return SelectActions.PageDown;
		} else if (key === "Escape") {
			return SelectActions.Close;
		} else if (key === "Enter" || key === " ") {
			return SelectActions.CloseSelect;
		}
	}
}

// return the index of an option from an array of options, based on a search string
// if the filter is multiple iterations of the same letter (e.g "aaa"), then cycle through first-letter matches
function getIndexByLetter(options, filter, startIndex = 0) {
	const orderedOptions = [
		...options.slice(startIndex),
		...options.slice(0, startIndex),
	];
	const firstMatch = filterOptions(orderedOptions, filter)[0];
	const allSameLetter = (array) => array.every((letter) => letter === array[0]);

	// first check if there is an exact match for the typed string
	if (firstMatch) {
		return options.indexOf(firstMatch);
	}

	// if the same letter is being repeated, cycle through first-letter matches
	else if (allSameLetter(filter.split(""))) {
		const matches = filterOptions(orderedOptions, filter[0]);
		return options.indexOf(matches[0]);
	}

	// if no matches, return -1
	else {
		return -1;
	}
}

// get an updated option index after performing an action
function getUpdatedIndex(currentIndex, maxIndex, action) {
	const pageSize = 10; // used for pageup/pagedown

	switch (action) {
		case SelectActions.First:
			return 0;
		case SelectActions.Last:
			return maxIndex;
		case SelectActions.Previous:
			return Math.max(0, currentIndex - 1);
		case SelectActions.Next:
			return Math.min(maxIndex, currentIndex + 1);
		case SelectActions.PageUp:
			return Math.max(0, currentIndex - pageSize);
		case SelectActions.PageDown:
			return Math.min(maxIndex, currentIndex + pageSize);
		default:
			return currentIndex;
	}
}

// check if element is visible in browser view port
function isElementInView(element) {
	var bounding = element.getBoundingClientRect();

	return (
		bounding.top >= 0 &&
		bounding.left >= 0 &&
		bounding.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
		bounding.right <=
			(window.innerWidth || document.documentElement.clientWidth)
	);
}

// check if an element is currently scrollable
function isScrollable(element) {
	return element && element.clientHeight < element.scrollHeight;
}

// ensure a given child element is within the parent's visible scroll area
// if the child is not visible, scroll the parent
function maintainScrollVisibility(activeElement, scrollParent) {
	const { offsetHeight, offsetTop } = activeElement;
	const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

	const isAbove = offsetTop < scrollTop;
	const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

	if (isAbove) {
		scrollParent.scrollTo(0, offsetTop);
	} else if (isBelow) {
		scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
	}
}

/*
 * Select Component
 * Accepts a combobox element and an array of string options
 */
const Select = function (el, options = []) {
	// element refs
	this.el = el;
	this.comboEl = el.querySelector("[role=combobox]");
	this.listboxEl = el.querySelector("[role=listbox]");

	// data
	this.idBase = this.comboEl.id || "combo";
	this.options = options;

	// state
	this.activeIndex = 0;
	this.open = false;
	this.searchString = "";
	this.searchTimeout = null;

	// init
	if (el && this.comboEl && this.listboxEl) {
		this.init();
	}
};

Select.prototype.init = function () {
	// select first option by default
	this.comboEl.innerHTML = this.options[0];

	// add event listeners
	this.comboEl.addEventListener("blur", this.onComboBlur.bind(this));
	this.comboEl.addEventListener("click", this.onComboClick.bind(this));
	this.comboEl.addEventListener("keydown", this.onComboKeyDown.bind(this));

	// create options
	this.options.map((option, index) => {
		const optionEl = this.createOption(option, index);
		this.listboxEl.appendChild(optionEl);
	});
};

Select.prototype.createOption = function (optionText, index) {
	const optionEl = document.createElement("div");
	optionEl.setAttribute("role", "option");
	optionEl.id = `${this.idBase}-${index}`;
	optionEl.className =
		index === 0 ? "combo-option option-current" : "combo-option";
	optionEl.setAttribute("aria-selected", `${index === 0}`);
	optionEl.innerText = optionText;

	optionEl.addEventListener("click", (event) => {
		event.stopPropagation();
		this.onOptionClick(index);
	});
	optionEl.addEventListener("mousedown", this.onOptionMouseDown.bind(this));

	return optionEl;
};

Select.prototype.getSearchString = function (char) {
	// reset typing timeout and start new timeout
	// this allows us to make multiple-letter matches, like a native select
	if (typeof this.searchTimeout === "number") {
		window.clearTimeout(this.searchTimeout);
	}

	this.searchTimeout = window.setTimeout(() => {
		this.searchString = "";
	}, 500);

	// add most recent letter to saved search string
	this.searchString += char;
	return this.searchString;
};

Select.prototype.onComboBlur = function () {
	// do not do blur action if ignoreBlur flag has been set
	if (this.ignoreBlur) {
		this.ignoreBlur = false;
		return;
	}

	// select current option and close
	if (this.open) {
		this.selectOption(this.activeIndex);
		this.updateMenuState(false, false);
	}
};

Select.prototype.onComboClick = function () {
	this.updateMenuState(!this.open, false);
};

Select.prototype.onComboKeyDown = function (event) {
	const { key } = event;
	const max = this.options.length - 1;

	const action = getActionFromKey(event, this.open);

	switch (action) {
		case SelectActions.Last:
		case SelectActions.First:
			this.updateMenuState(true);
		// intentional fallthrough
		case SelectActions.Next:
		case SelectActions.Previous:
		case SelectActions.PageUp:
		case SelectActions.PageDown:
			event.preventDefault();
			return this.onOptionChange(
				getUpdatedIndex(this.activeIndex, max, action)
			);
		case SelectActions.CloseSelect:
			event.preventDefault();
			this.selectOption(this.activeIndex);
		// intentional fallthrough
		case SelectActions.Close:
			event.preventDefault();
			return this.updateMenuState(false);
		case SelectActions.Type:
			return this.onComboType(key);
		case SelectActions.Open:
			event.preventDefault();
			return this.updateMenuState(true);
	}
};

Select.prototype.onComboType = function (letter) {
	// open the listbox if it is closed
	this.updateMenuState(true);

	// find the index of the first matching option
	const searchString = this.getSearchString(letter);
	const searchIndex = getIndexByLetter(
		this.options,
		searchString,
		this.activeIndex + 1
	);

	// if a match was found, go to it
	if (searchIndex >= 0) {
		this.onOptionChange(searchIndex);
	}
	// if no matches, clear the timeout and search string
	else {
		window.clearTimeout(this.searchTimeout);
		this.searchString = "";
	}
};

Select.prototype.onOptionChange = function (index) {
	// update state
	this.activeIndex = index;

	// update aria-activedescendant
	this.comboEl.setAttribute("aria-activedescendant", `${this.idBase}-${index}`);

	// update active option styles
	const options = this.el.querySelectorAll("[role=option]");
	[...options].forEach((optionEl) => {
		optionEl.classList.remove("option-current");
	});
	options[index].classList.add("option-current");

	// ensure the new option is in view
	if (isScrollable(this.listboxEl)) {
		maintainScrollVisibility(options[index], this.listboxEl);
	}

	// ensure the new option is visible on screen
	// ensure the new option is in view
	if (!isElementInView(options[index])) {
		options[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
	}
};

Select.prototype.onOptionClick = function (index) {
	this.onOptionChange(index);
	this.selectOption(index);
	this.updateMenuState(false);
};

Select.prototype.onOptionMouseDown = function () {
	// Clicking an option will cause a blur event,
	// but we don't want to perform the default keyboard blur action
	this.ignoreBlur = true;
};

Select.prototype.selectOption = function (index) {
	// update state
	this.activeIndex = index;

	// update displayed value
	const selected = this.options[index];
	this.comboEl.innerHTML = selected;

	// update aria-selected
	const options = this.el.querySelectorAll("[role=option]");
	[...options].forEach((optionEl) => {
		optionEl.setAttribute("aria-selected", "false");
	});
	options[index].setAttribute("aria-selected", "true");
};

Select.prototype.updateMenuState = function (open, callFocus = true) {
	if (this.open === open) {
		return;
	}

	// update state
	this.open = open;

	// update aria-expanded and styles
	this.comboEl.setAttribute("aria-expanded", `${open}`);
	open ? this.el.classList.add("open") : this.el.classList.remove("open");

	// update activedescendant
	const activeID = open ? `${this.idBase}-${this.activeIndex}` : "";
	this.comboEl.setAttribute("aria-activedescendant", activeID);

	if (activeID === "" && !isElementInView(this.comboEl)) {
		this.comboEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}

	// move focus back to the combobox, if needed
	callFocus && this.comboEl.focus();
};

// init select
window.addEventListener("load", function () {
	const options = [
		"Choose a Fruit",
		"Apple",
		"Banana",
		"Blueberry",
		"Boysenberry",
		"Cherry",
		"Cranberry",
		"Durian",
		"Eggplant",
		"Fig",
		"Grape",
		"Guava",
		"Huckleberry",
	];
	const selectEls = document.querySelectorAll(".js-select");

	selectEls.forEach((el) => {
		new Select(el, options);
	});
});

/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

("use strict");

class ComboboxAutocomplete {
	constructor(comboboxNode, buttonNode, listboxNode) {
		this.comboboxNode = comboboxNode;
		this.buttonNode = buttonNode;
		this.listboxNode = listboxNode;

		this.comboboxHasVisualFocus = false;
		this.listboxHasVisualFocus = false;

		this.hasHover = false;

		this.isNone = false;
		this.isList = false;
		this.isBoth = false;

		this.allOptions = [];

		this.option = null;
		this.firstOption = null;
		this.lastOption = null;

		this.filteredOptions = [];
		this.filter = "";

		var autocomplete = this.comboboxNode.getAttribute("aria-autocomplete");

		if (typeof autocomplete === "string") {
			autocomplete = autocomplete.toLowerCase();
			this.isNone = autocomplete === "none";
			this.isList = autocomplete === "list";
			this.isBoth = autocomplete === "both";
		} else {
			// default value of autocomplete
			this.isNone = true;
		}

		this.comboboxNode.addEventListener(
			"keydown",
			this.onComboboxKeyDown.bind(this)
		);
		this.comboboxNode.addEventListener(
			"keyup",
			this.onComboboxKeyUp.bind(this)
		);
		this.comboboxNode.addEventListener(
			"click",
			this.onComboboxClick.bind(this)
		);
		this.comboboxNode.addEventListener(
			"focus",
			this.onComboboxFocus.bind(this)
		);
		this.comboboxNode.addEventListener("blur", this.onComboboxBlur.bind(this));

		document.body.addEventListener(
			"pointerup",
			this.onBackgroundPointerUp.bind(this),
			true
		);

		// initialize pop up menu

		this.listboxNode.addEventListener(
			"pointerover",
			this.onListboxPointerover.bind(this)
		);
		this.listboxNode.addEventListener(
			"pointerout",
			this.onListboxPointerout.bind(this)
		);

		// Traverse the element children of domNode: configure each with
		// option role behavior and store reference in.options array.
		var nodes = this.listboxNode.getElementsByTagName("LI");

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			this.allOptions.push(node);

			node.addEventListener("click", this.onOptionClick.bind(this));
			node.addEventListener("pointerover", this.onOptionPointerover.bind(this));
			node.addEventListener("pointerout", this.onOptionPointerout.bind(this));
		}

		this.filterOptions();

		// Open Button

		var button = this.comboboxNode.nextElementSibling;

		if (button && button.tagName === "BUTTON") {
			button.addEventListener("click", this.onButtonClick.bind(this));
		}
	}

	getLowercaseContent(node) {
		return node.textContent.toLowerCase();
	}

	isOptionInView(option) {
		var bounding = option.getBoundingClientRect();
		return (
			bounding.top >= 0 &&
			bounding.left >= 0 &&
			bounding.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			bounding.right <=
				(window.innerWidth || document.documentElement.clientWidth)
		);
	}

	setActiveDescendant(option) {
		if (option && this.listboxHasVisualFocus) {
			this.comboboxNode.setAttribute("aria-activedescendant", option.id);
			if (!this.isOptionInView(option)) {
				option.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}
		} else {
			this.comboboxNode.setAttribute("aria-activedescendant", "");
		}
	}

	setValue(value) {
		this.filter = value;
		this.comboboxNode.value = this.filter;
		this.comboboxNode.setSelectionRange(this.filter.length, this.filter.length);
		this.filterOptions();
	}

	setOption(option, flag) {
		if (typeof flag !== "boolean") {
			flag = false;
		}

		if (option) {
			this.option = option;
			this.setCurrentOptionStyle(this.option);
			this.setActiveDescendant(this.option);

			if (this.isBoth) {
				this.comboboxNode.value = this.option.textContent;
				if (flag) {
					this.comboboxNode.setSelectionRange(
						this.option.textContent.length,
						this.option.textContent.length
					);
				} else {
					this.comboboxNode.setSelectionRange(
						this.filter.length,
						this.option.textContent.length
					);
				}
			}
		}
	}

	setVisualFocusCombobox() {
		this.listboxNode.classList.remove("focus");
		this.comboboxNode.parentNode.classList.add("focus"); // set the focus class to the parent for easier styling
		this.comboboxHasVisualFocus = true;
		this.listboxHasVisualFocus = false;
		this.setActiveDescendant(false);
	}

	setVisualFocusListbox() {
		this.comboboxNode.parentNode.classList.remove("focus");
		this.comboboxHasVisualFocus = false;
		this.listboxHasVisualFocus = true;
		this.listboxNode.classList.add("focus");
		this.setActiveDescendant(this.option);
	}

	removeVisualFocusAll() {
		this.comboboxNode.parentNode.classList.remove("focus");
		this.comboboxHasVisualFocus = false;
		this.listboxHasVisualFocus = false;
		this.listboxNode.classList.remove("focus");
		this.option = null;
		this.setActiveDescendant(false);
	}

	// ComboboxAutocomplete Events

	filterOptions() {
		// do not filter any options if autocomplete is none
		if (this.isNone) {
			this.filter = "";
		}

		var option = null;
		var currentOption = this.option;
		var filter = this.filter.toLowerCase();

		this.filteredOptions = [];
		this.listboxNode.innerHTML = "";

		for (var i = 0; i < this.allOptions.length; i++) {
			option = this.allOptions[i];
			if (
				filter.length === 0 ||
				this.getLowercaseContent(option).indexOf(filter) === 0
			) {
				this.filteredOptions.push(option);
				this.listboxNode.appendChild(option);
			}
		}

		// Use populated options array to initialize firstOption and lastOption.
		var numItems = this.filteredOptions.length;
		if (numItems > 0) {
			this.firstOption = this.filteredOptions[0];
			this.lastOption = this.filteredOptions[numItems - 1];

			if (currentOption && this.filteredOptions.indexOf(currentOption) >= 0) {
				option = currentOption;
			} else {
				option = this.firstOption;
			}
		} else {
			this.firstOption = null;
			option = null;
			this.lastOption = null;
		}

		return option;
	}

	setCurrentOptionStyle(option) {
		for (var i = 0; i < this.filteredOptions.length; i++) {
			var opt = this.filteredOptions[i];
			if (opt === option) {
				opt.setAttribute("aria-selected", "true");
				if (
					this.listboxNode.scrollTop + this.listboxNode.offsetHeight <
					opt.offsetTop + opt.offsetHeight
				) {
					this.listboxNode.scrollTop =
						opt.offsetTop + opt.offsetHeight - this.listboxNode.offsetHeight;
				} else if (this.listboxNode.scrollTop > opt.offsetTop + 2) {
					this.listboxNode.scrollTop = opt.offsetTop;
				}
			} else {
				opt.removeAttribute("aria-selected");
			}
		}
	}

	getPreviousOption(currentOption) {
		if (currentOption !== this.firstOption) {
			var index = this.filteredOptions.indexOf(currentOption);
			return this.filteredOptions[index - 1];
		}
		return this.lastOption;
	}

	getNextOption(currentOption) {
		if (currentOption !== this.lastOption) {
			var index = this.filteredOptions.indexOf(currentOption);
			return this.filteredOptions[index + 1];
		}
		return this.firstOption;
	}

	/* MENU DISPLAY METHODS */

	doesOptionHaveFocus() {
		return this.comboboxNode.getAttribute("aria-activedescendant") !== "";
	}

	isOpen() {
		return this.listboxNode.style.display === "block";
	}

	isClosed() {
		return this.listboxNode.style.display !== "block";
	}

	hasOptions() {
		return this.filteredOptions.length;
	}

	open() {
		this.listboxNode.style.display = "block";
		this.comboboxNode.setAttribute("aria-expanded", "true");
		this.buttonNode.setAttribute("aria-expanded", "true");
	}

	close(force) {
		if (typeof force !== "boolean") {
			force = false;
		}

		if (
			force ||
			(!this.comboboxHasVisualFocus &&
				!this.listboxHasVisualFocus &&
				!this.hasHover)
		) {
			this.setCurrentOptionStyle(false);
			this.listboxNode.style.display = "none";
			this.comboboxNode.setAttribute("aria-expanded", "false");
			this.buttonNode.setAttribute("aria-expanded", "false");
			this.setActiveDescendant(false);
			this.comboboxNode.parentNode.classList.add("focus");
		}
	}

	/* combobox Events */

	onComboboxKeyDown(event) {
		var flag = false,
			altKey = event.altKey;

		if (event.ctrlKey || event.shiftKey) {
			return;
		}

		switch (event.key) {
			case "Enter":
				if (this.listboxHasVisualFocus) {
					this.setValue(this.option.textContent);
				}
				this.close(true);
				this.setVisualFocusCombobox();
				flag = true;
				break;

			case "Down":
			case "ArrowDown":
				if (this.filteredOptions.length > 0) {
					if (altKey) {
						this.open();
					} else {
						this.open();
						if (
							this.listboxHasVisualFocus ||
							(this.isBoth && this.filteredOptions.length > 1)
						) {
							this.setOption(this.getNextOption(this.option), true);
							this.setVisualFocusListbox();
						} else {
							this.setOption(this.firstOption, true);
							this.setVisualFocusListbox();
						}
					}
				}
				flag = true;
				break;

			case "Up":
			case "ArrowUp":
				if (this.hasOptions()) {
					if (this.listboxHasVisualFocus) {
						this.setOption(this.getPreviousOption(this.option), true);
					} else {
						this.open();
						if (!altKey) {
							this.setOption(this.lastOption, true);
							this.setVisualFocusListbox();
						}
					}
				}
				flag = true;
				break;

			case "Esc":
			case "Escape":
				if (this.isOpen()) {
					this.close(true);
					this.filter = this.comboboxNode.value;
					this.filterOptions();
					this.setVisualFocusCombobox();
				} else {
					this.setValue("");
					this.comboboxNode.value = "";
				}
				this.option = null;
				flag = true;
				break;

			case "Tab":
				this.close(true);
				if (this.listboxHasVisualFocus) {
					if (this.option) {
						this.setValue(this.option.textContent);
					}
				}
				break;

			case "Home":
				this.comboboxNode.setSelectionRange(0, 0);
				flag = true;
				break;

			case "End":
				var length = this.comboboxNode.value.length;
				this.comboboxNode.setSelectionRange(length, length);
				flag = true;
				break;

			default:
				break;
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	isPrintableCharacter(str) {
		return str.length === 1 && str.match(/\S| /);
	}

	onComboboxKeyUp(event) {
		var flag = false,
			option = null,
			char = event.key;

		if (this.isPrintableCharacter(char)) {
			this.filter += char;
		}

		// this is for the case when a selection in the textbox has been deleted
		if (this.comboboxNode.value.length < this.filter.length) {
			this.filter = this.comboboxNode.value;
			this.option = null;
			this.filterOptions();
		}

		if (event.key === "Escape" || event.key === "Esc") {
			return;
		}

		switch (event.key) {
			case "Backspace":
				this.setVisualFocusCombobox();
				this.setCurrentOptionStyle(false);
				this.filter = this.comboboxNode.value;
				this.option = null;
				this.filterOptions();
				flag = true;
				break;

			case "Left":
			case "ArrowLeft":
			case "Right":
			case "ArrowRight":
			case "Home":
			case "End":
				if (this.isBoth) {
					this.filter = this.comboboxNode.value;
				} else {
					this.option = null;
					this.setCurrentOptionStyle(false);
				}
				this.setVisualFocusCombobox();
				flag = true;
				break;

			default:
				if (this.isPrintableCharacter(char)) {
					this.setVisualFocusCombobox();
					this.setCurrentOptionStyle(false);
					flag = true;

					if (this.isList || this.isBoth) {
						option = this.filterOptions();
						if (option) {
							if (this.isClosed() && this.comboboxNode.value.length) {
								this.open();
							}

							if (
								this.getLowercaseContent(option).indexOf(
									this.comboboxNode.value.toLowerCase()
								) === 0
							) {
								this.option = option;
								if (this.isBoth || this.listboxHasVisualFocus) {
									this.setCurrentOptionStyle(option);
									if (this.isBoth) {
										this.setOption(option);
									}
								}
							} else {
								this.option = null;
								this.setCurrentOptionStyle(false);
							}
						} else {
							this.close();
							this.option = null;
							this.setActiveDescendant(false);
						}
					} else if (this.comboboxNode.value.length) {
						this.open();
					}
				}

				break;
		}

		if (flag) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	onComboboxClick() {
		if (this.isOpen()) {
			this.close(true);
		} else {
			this.open();
		}
	}

	onComboboxFocus() {
		this.filter = this.comboboxNode.value;
		this.filterOptions();
		this.setVisualFocusCombobox();
		this.option = null;
		this.setCurrentOptionStyle(null);
	}

	onComboboxBlur() {
		this.removeVisualFocusAll();
	}

	onBackgroundPointerUp(event) {
		if (
			!this.comboboxNode.contains(event.target) &&
			!this.listboxNode.contains(event.target) &&
			!this.buttonNode.contains(event.target)
		) {
			this.comboboxHasVisualFocus = false;
			this.setCurrentOptionStyle(null);
			this.removeVisualFocusAll();
			setTimeout(this.close.bind(this, true), 300);
		}
	}

	onButtonClick() {
		if (this.isOpen()) {
			this.close(true);
		} else {
			this.open();
		}
		this.comboboxNode.focus();
		this.setVisualFocusCombobox();
	}

	/* Listbox Events */

	onListboxPointerover() {
		this.hasHover = true;
	}

	onListboxPointerout() {
		this.hasHover = false;
		setTimeout(this.close.bind(this, false), 300);
	}

	// Listbox Option Events

	onOptionClick(event) {
		this.comboboxNode.value = event.target.textContent;
		this.close(true);
	}

	onOptionPointerover() {
		this.hasHover = true;
		this.open();
	}

	onOptionPointerout() {
		this.hasHover = false;
		setTimeout(this.close.bind(this, false), 300);
	}
}

// Initialize comboboxes

window.addEventListener("load", function () {
	var comboboxes = document.querySelectorAll(".combobox-list");

	for (var i = 0; i < comboboxes.length; i++) {
		var combobox = comboboxes[i];
		var comboboxNode = combobox.querySelector("input");
		var buttonNode = combobox.querySelector("button");
		var listboxNode = combobox.querySelector('[role="listbox"]');
		new ComboboxAutocomplete(comboboxNode, buttonNode, listboxNode);
	}
});

// dialog
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

("use strict");
(function () {
	/*
	 * When util functions move focus around, set this true so the focus listener
	 * can ignore the events.
	 */
	aria.Utils.IgnoreUtilFocusChanges = false;

	aria.Utils.dialogOpenClass = "has-dialog";

	/**
	 * @description Set focus on descendant nodes until the first focusable element is
	 *       found.
	 * @param element
	 *          DOM node for which to find the first focusable descendant.
	 * @returns {boolean}
	 *  true if a focusable element is found and focus is set.
	 */
	aria.Utils.focusFirstDescendant = function (element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (
				aria.Utils.attemptFocus(child) ||
				aria.Utils.focusFirstDescendant(child)
			) {
				return true;
			}
		}
		return false;
	}; // end focusFirstDescendant

	/**
	 * @description Find the last descendant node that is focusable.
	 * @param element
	 *          DOM node for which to find the last focusable descendant.
	 * @returns {boolean}
	 *  true if a focusable element is found and focus is set.
	 */
	aria.Utils.focusLastDescendant = function (element) {
		for (var i = element.childNodes.length - 1; i >= 0; i--) {
			var child = element.childNodes[i];
			if (
				aria.Utils.attemptFocus(child) ||
				aria.Utils.focusLastDescendant(child)
			) {
				return true;
			}
		}
		return false;
	}; // end focusLastDescendant

	/**
	 * @description Set Attempt to set focus on the current node.
	 * @param element
	 *          The node to attempt to focus on.
	 * @returns {boolean}
	 *  true if element is focused.
	 */
	aria.Utils.attemptFocus = function (element) {
		if (!aria.Utils.isFocusable(element)) {
			return false;
		}

		aria.Utils.IgnoreUtilFocusChanges = true;
		try {
			element.focus();
		} catch (e) {
			// continue regardless of error
		}
		aria.Utils.IgnoreUtilFocusChanges = false;
		return document.activeElement === element;
	}; // end attemptFocus

	/* Modals can open modals. Keep track of them with this array. */
	aria.OpenDialogList = aria.OpenDialogList || new Array(0);

	/**
	 * @returns {object} the last opened dialog (the current dialog)
	 */
	aria.getCurrentDialog = function () {
		if (aria.OpenDialogList && aria.OpenDialogList.length) {
			return aria.OpenDialogList[aria.OpenDialogList.length - 1];
		}
	};

	aria.closeCurrentDialog = function () {
		var currentDialog = aria.getCurrentDialog();
		if (currentDialog) {
			currentDialog.close();
			return true;
		}

		return false;
	};

	aria.handleEscape = function (event) {
		var key = event.which || event.keyCode;

		if (key === aria.KeyCode.ESC && aria.closeCurrentDialog()) {
			event.stopPropagation();
		}
	};

	document.addEventListener("keyup", aria.handleEscape);

	/**
	 * @class
	 * @description Dialog object providing modal focus management.
	 *
	 * Assumptions: The element serving as the dialog container is present in the
	 * DOM and hidden. The dialog container has role='dialog'.
	 * @param dialogId
	 *          The ID of the element serving as the dialog container.
	 * @param focusAfterClosed
	 *          Either the DOM node or the ID of the DOM node to focus when the
	 *          dialog closes.
	 * @param focusFirst
	 *          Optional parameter containing either the DOM node or the ID of the
	 *          DOM node to focus when the dialog opens. If not specified, the
	 *          first focusable element in the dialog will receive focus.
	 */
	aria.Dialog = function (dialogId, focusAfterClosed, focusFirst) {
		this.dialogNode = document.getElementById(dialogId);
		if (this.dialogNode === null) {
			throw new Error('No element found with id="' + dialogId + '".');
		}

		var validRoles = ["dialog", "alertdialog"];
		var isDialog = (this.dialogNode.getAttribute("role") || "")
			.trim()
			.split(/\s+/g)
			.some(function (token) {
				return validRoles.some(function (role) {
					return token === role;
				});
			});
		if (!isDialog) {
			throw new Error(
				"Dialog() requires a DOM element with ARIA role of dialog or alertdialog."
			);
		}

		// Wrap in an individual backdrop element if one doesn't exist
		// Native <dialog> elements use the ::backdrop pseudo-element, which
		// works similarly.
		var backdropClass = "dialog-backdrop";
		if (this.dialogNode.parentNode.classList.contains(backdropClass)) {
			this.backdropNode = this.dialogNode.parentNode;
		} else {
			this.backdropNode = document.createElement("div");
			this.backdropNode.className = backdropClass;
			this.dialogNode.parentNode.insertBefore(
				this.backdropNode,
				this.dialogNode
			);
			this.backdropNode.appendChild(this.dialogNode);
		}
		this.backdropNode.classList.add("active");

		// Disable scroll on the body element
		document.body.classList.add(aria.Utils.dialogOpenClass);

		if (typeof focusAfterClosed === "string") {
			this.focusAfterClosed = document.getElementById(focusAfterClosed);
		} else if (typeof focusAfterClosed === "object") {
			this.focusAfterClosed = focusAfterClosed;
		} else {
			throw new Error(
				"the focusAfterClosed parameter is required for the aria.Dialog constructor."
			);
		}

		if (typeof focusFirst === "string") {
			this.focusFirst = document.getElementById(focusFirst);
		} else if (typeof focusFirst === "object") {
			this.focusFirst = focusFirst;
		} else {
			this.focusFirst = null;
		}

		// Bracket the dialog node with two invisible, focusable nodes.
		// While this dialog is open, we use these to make sure that focus never
		// leaves the document even if dialogNode is the first or last node.
		var preDiv = document.createElement("div");
		this.preNode = this.dialogNode.parentNode.insertBefore(
			preDiv,
			this.dialogNode
		);
		this.preNode.tabIndex = 0;
		var postDiv = document.createElement("div");
		this.postNode = this.dialogNode.parentNode.insertBefore(
			postDiv,
			this.dialogNode.nextSibling
		);
		this.postNode.tabIndex = 0;

		// If this modal is opening on top of one that is already open,
		// get rid of the document focus listener of the open dialog.
		if (aria.OpenDialogList.length > 0) {
			aria.getCurrentDialog().removeListeners();
		}

		this.addListeners();
		aria.OpenDialogList.push(this);
		this.clearDialog();
		this.dialogNode.className = "default_dialog"; // make visible

		if (this.focusFirst) {
			this.focusFirst.focus();
		} else {
			aria.Utils.focusFirstDescendant(this.dialogNode);
		}

		this.lastFocus = document.activeElement;
	}; // end Dialog constructor

	aria.Dialog.prototype.clearDialog = function () {
		Array.prototype.map.call(
			this.dialogNode.querySelectorAll("input"),
			function (input) {
				input.value = "";
			}
		);
	};

	/**
	 * @description
	 *  Hides the current top dialog,
	 *  removes listeners of the top dialog,
	 *  restore listeners of a parent dialog if one was open under the one that just closed,
	 *  and sets focus on the element specified for focusAfterClosed.
	 */
	aria.Dialog.prototype.close = function () {
		aria.OpenDialogList.pop();
		this.removeListeners();
		aria.Utils.remove(this.preNode);
		aria.Utils.remove(this.postNode);
		this.dialogNode.className = "hidden";
		this.backdropNode.classList.remove("active");
		this.focusAfterClosed.focus();

		// If a dialog was open underneath this one, restore its listeners.
		if (aria.OpenDialogList.length > 0) {
			aria.getCurrentDialog().addListeners();
		} else {
			document.body.classList.remove(aria.Utils.dialogOpenClass);
		}
	}; // end close

	/**
	 * @description
	 *  Hides the current dialog and replaces it with another.
	 * @param newDialogId
	 *  ID of the dialog that will replace the currently open top dialog.
	 * @param newFocusAfterClosed
	 *  Optional ID or DOM node specifying where to place focus when the new dialog closes.
	 *  If not specified, focus will be placed on the element specified by the dialog being replaced.
	 * @param newFocusFirst
	 *  Optional ID or DOM node specifying where to place focus in the new dialog when it opens.
	 *  If not specified, the first focusable element will receive focus.
	 */
	aria.Dialog.prototype.replace = function (
		newDialogId,
		newFocusAfterClosed,
		newFocusFirst
	) {
		aria.OpenDialogList.pop();
		this.removeListeners();
		aria.Utils.remove(this.preNode);
		aria.Utils.remove(this.postNode);
		this.dialogNode.className = "hidden";
		this.backdropNode.classList.remove("active");

		var focusAfterClosed = newFocusAfterClosed || this.focusAfterClosed;
		new aria.Dialog(newDialogId, focusAfterClosed, newFocusFirst);
	}; // end replace

	aria.Dialog.prototype.addListeners = function () {
		document.addEventListener("focus", this.trapFocus, true);
	}; // end addListeners

	aria.Dialog.prototype.removeListeners = function () {
		document.removeEventListener("focus", this.trapFocus, true);
	}; // end removeListeners

	aria.Dialog.prototype.trapFocus = function (event) {
		if (aria.Utils.IgnoreUtilFocusChanges) {
			return;
		}
		var currentDialog = aria.getCurrentDialog();
		if (currentDialog.dialogNode.contains(event.target)) {
			currentDialog.lastFocus = event.target;
		} else {
			aria.Utils.focusFirstDescendant(currentDialog.dialogNode);
			if (currentDialog.lastFocus == document.activeElement) {
				aria.Utils.focusLastDescendant(currentDialog.dialogNode);
			}
			currentDialog.lastFocus = document.activeElement;
		}
	}; // end trapFocus

	window.openDialog = function (dialogId, focusAfterClosed, focusFirst) {
		new aria.Dialog(dialogId, focusAfterClosed, focusFirst);
	};

	window.closeDialog = function (closeButton) {
		var topDialog = aria.getCurrentDialog();
		if (topDialog.dialogNode.contains(closeButton)) {
			topDialog.close();
		}
	}; // end closeDialog

	window.replaceDialog = function (
		newDialogId,
		newFocusAfterClosed,
		newFocusFirst
	) {
		var topDialog = aria.getCurrentDialog();
		if (topDialog.dialogNode.contains(document.activeElement)) {
			topDialog.replace(newDialogId, newFocusAfterClosed, newFocusFirst);
		}
	}; // end replaceDialog
})();
("use strict");
/**
 * @namespace aria
 */

var aria = aria || {};

/**
 * @description
 *  Key code constants
 */
aria.KeyCode = {
	BACKSPACE: 8,
	TAB: 9,
	RETURN: 13,
	SHIFT: 16,
	ESC: 27,
	SPACE: 32,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
};

aria.Utils = aria.Utils || {};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
aria.Utils.matches = function (element, selector) {
	if (!Element.prototype.matches) {
		Element.prototype.matches =
			Element.prototype.matchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.oMatchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			function (s) {
				var matches = element.parentNode.querySelectorAll(s);
				var i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {
					// empty
				}
				return i > -1;
			};
	}

	return element.matches(selector);
};

aria.Utils.remove = function (item) {
	if (item.remove && typeof item.remove === "function") {
		return item.remove();
	}
	if (
		item.parentNode &&
		item.parentNode.removeChild &&
		typeof item.parentNode.removeChild === "function"
	) {
		return item.parentNode.removeChild(item);
	}
	return false;
};

aria.Utils.isFocusable = function (element) {
	if (element.tabIndex < 0) {
		return false;
	}

	if (element.disabled) {
		return false;
	}

	switch (element.nodeName) {
		case "A":
			return !!element.href && element.rel != "ignore";
		case "INPUT":
			return element.type != "hidden";
		case "BUTTON":
		case "SELECT":
		case "TEXTAREA":
			return true;
		default:
			return false;
	}
};

aria.Utils.getAncestorBySelector = function (element, selector) {
	if (!aria.Utils.matches(element, selector + " " + element.tagName)) {
		// Element is not inside an element that matches selector
		return null;
	}

	// Move up the DOM tree until a parent matching the selector is found
	var currentNode = element;
	var ancestor = null;
	while (ancestor === null) {
		if (aria.Utils.matches(currentNode.parentNode, selector)) {
			ancestor = currentNode.parentNode;
		} else {
			currentNode = currentNode.parentNode;
		}
	}

	return ancestor;
};

aria.Utils.hasClass = function (element, className) {
	return new RegExp("(\\s|^)" + className + "(\\s|$)").test(element.className);
};

aria.Utils.addClass = function (element, className) {
	if (!aria.Utils.hasClass(element, className)) {
		element.className += " " + className;
	}
};

aria.Utils.removeClass = function (element, className) {
	var classRegex = new RegExp("(\\s|^)" + className + "(\\s|$)");
	element.className = element.className.replace(classRegex, " ").trim();
};

aria.Utils.bindMethods = function (object /* , ...methodNames */) {
	var methodNames = Array.prototype.slice.call(arguments, 1);
	methodNames.forEach(function (method) {
		object[method] = object[method].bind(object);
	});
};
