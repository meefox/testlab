/**
 * @copyright Copyright (c) 2013. All rights reserved.
 * @author Yuriy Sinyaev <meefox@gmail.com>
 * @version 1.0
 * @description classList polyfill for lagacy browsers
 **/

;( function( window, document, Object, DOMTokenList ) {
	var self = this;

	self._init = function() {
		if ( document.documentElement.classList === undefined ) {
			Object.defineProperty( HTMLElement.prototype, 'classList', {
				get: self._legacy
			} );
		} else {
			self._modern();
		}
	};

	self._legacy = function() {
		/** {HTMLElement} element */
		var element = this;

		var classListMethods = {
			/**
			 * Return class name by index and null if not find
			 * @param {number} index
			 * @return {string} class name or {null}
			 */
			item: function( index ) {
				return element.className.split(' ')[index] || null;
			},

			/**
			 * Add class to the element
			 * @param {string} cssClass
			 * @return {boolean}
			 */
			add: function( cssClass ) {
				var classes = element.className.split(' ');

				if ( classes.indexOf(cssClass) === -1 ) {
					classes.push(cssClass);
					element.className = classes.join(' ');
				}
			},

			/**
			 * Remove class from the element
			 * @param {string} cssClass
			 */
			remove: function( cssClass ) {
				var classes = element.className.split(' '),
					classIndex = classes.indexOf(cssClass);

				if ( classIndex > -1 ) {
					classes.splice(classIndex, 1);
					element.className = classes.join(' ');
				}
			},

			/**
			 * Check if class contains in element
			 * @param {string} cssClass
			 * @return {boolean}
			 */
			contains: function( cssClass ) {
				return element.className.split(' ').indexOf( cssClass ) > -1;
			},

			/**
			 * Toggle class
			 * @param {string} cssClass
			 */
			toggle: function( cssClass ) {
				var classes = element.className.split(' '),
					index = classes.indexOf(cssClass);

				( index > -1 ) ? element.classList.remove(cssClass) : element.classList.add(cssClass);
			},

			/**
			 * Return all classes as an array of strings
			 * @return {array}
			 */
			getAll: function() {
				return element.className.split(' ');
			},

			/**
			 * Return all class as a string
			 * @return {string} cssClass
			 */
			toString: function() {
				return element.className;
			}
		};

		/**
		 * Show a length of all css classes
		 * @return {number} length
		 */
		Object.defineProperty(classListMethods, 'length', {
			get: function() {
				return element.className.split(' ').length;
			}
		});

		return classListMethods;
	};

	/**
	 * Extended classList for modern browsers
	 * classList.getAll()
	 */
	self._modern = function() {
		/**
		 * Return all classes as an array of strings
		 * @return {array}
		 */
		DOMTokenList.prototype.getAll = function() {
			var classList = this,
				classListLength = classList.length,
				classes = [];

			for ( var i = 0; i < classListLength; i++ ) {
				classes.push(classList[i]);
			}

			return classes;
		};
	};

	self._init();

} )( window, document, Object, DOMTokenList );