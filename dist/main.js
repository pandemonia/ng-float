/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(11);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _container = __webpack_require__(3);

var _container2 = _interopRequireDefault(_container);

var _item = __webpack_require__(7);

var _item2 = _interopRequireDefault(_item);

var _mapper = __webpack_require__(12);

var _mapper2 = _interopRequireDefault(_mapper);

__webpack_require__(13);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = angular.module('float', []).directive('flContainer', _container2.default).directive('flItem', _item2.default).service('flMapper', _mapper2.default);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function () {
  return {
    restrict: 'A',
    bindToController: {
      options: '=flContainer',
      isEditable: '=flEditable',
      createElementsAtPosition: '&flCreateElementsAtPosition'
    },
    controllerAs: 'flContainer',
    controller: ['flMapper', '$element', '$document', '$scope', '$timeout', function () {
      function FlContainer(flMapper, $element, $document, $scope, $timeout) {
        var _this = this;

        _classCallCheck(this, FlContainer);

        this.flItems = [];
        this.mapper = flMapper;
        this.mapper.initialize(this.options);
        this.$element = $element;
        this.$timeout = $timeout;
        this.$element.css('width', this.mapper.width);

        if (this.isEditable) {
          this.setupDropListeners();
          this.setupVisitListeners($document, $scope);
        }

        // Giving a 500ms timeout for ngRepeat items to kick in. If there are no
        // items then it means the container is empty.
        $timeout(function () {
          if (!_this.container && _this.flItems.length === 0) {
            _this.container = new _Container2.default();
            _this.render();
          }
        }, 500);
      }

      /**
       * Adds an item to the container. If the container is not initiated,
       * it is initiated at the last repeat of the ngRepeat iteration which
       * the items are in.
       */


      _createClass(FlContainer, [{
        key: 'initItem',
        value: function initItem(flItem) {
          var _this2 = this;

          this.flItems.push(flItem);

          if (this.container) {
            this.container.addItem(flItem.item);
            this.render();
          } else {
            if (flItem.lastRepeat) {
              this.container = new _Container2.default(this.flItems.map(function (flItem) {
                return flItem.item;
              }));
              this.$timeout(function () {
                _this2.render();
              });
            }
          }
        }
      }, {
        key: 'render',
        value: function render() {
          this.container.removeGaps();
          this.$element.css('height', this.mapper.height2px(this.container.getMaxHeight()) + 100);
          this.flItems.forEach(function (flItem) {
            return flItem.render();
          });
        }
      }, {
        key: 'onItemEditStart',
        value: function onItemEditStart() {
          this.$element.addClass('fl-container-editing');
          this.$element.css('height', this.$element.height() + 1000);
        }
      }, {
        key: 'onItemEditEnd',
        value: function onItemEditEnd(item, layout) {
          this.$element.removeClass('fl-container-editing');
          this.container.editItem(item, layout);
          this.render();
        }
      }, {
        key: 'onItemRemove',
        value: function onItemRemove(flItem) {
          var index = this.flItems.indexOf(flItem);
          if (index !== -1) {
            this.flItems.splice(index, 1);
          }

          this.container.removeItem(flItem.item);
          this.render();
        }
      }, {
        key: 'getNewItemDimensions',
        value: function getNewItemDimensions(pixels) {
          return this.container.getClosestTop(this.mapper.getClosestPosition(pixels));
        }
      }, {
        key: 'setupDropListeners',
        value: function setupDropListeners() {
          var _this3 = this;

          function _setDropIndicatorPos() {
            var left = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -10000;
            var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -10000;
            var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            dropIndicator.css({
              marginLeft: left,
              marginTop: top,
              width: width
            });
          }

          var dropIndicator = $('<div>').addClass('fl-drop-indicator').appendTo(this.$element);
          _setDropIndicatorPos();

          var throttledDragoverCallback = _lodash2.default.throttle(function (event) {
            if ($(event.target).is(_this3.$element)) {
              var pos = _this3.mapper.px2pos({
                left: event.offsetX,
                top: event.offsetY
              });

              var layout = Object.assign(pos, _this3.container.getWidthAtPos(pos));
              layout.height = _this3.mapper.minHeight;
              layout.width = Math.min(layout.width, _this3.mapper.numColumns - layout.left);
              if (layout.width < _this3.mapper.minWidth) {
                _setDropIndicatorPos();
              } else {
                var pixels = _this3.mapper.layout2px(_this3.mapper.checkPositionConstraints(layout));

                _setDropIndicatorPos(pixels.left, pixels.top, pixels.width);
              }
            } else {
              _setDropIndicatorPos();
            }
          }, 50);

          this.$element.on('dragover', function (event) {
            event.preventDefault();
            event.stopPropagation();
            throttledDragoverCallback(event);
          });

          this.$element.on('dragleave', function (event) {
            event.preventDefault();
            event.stopPropagation();
            throttledDragoverCallback.cancel();
            _setDropIndicatorPos();
          });

          this.$element.on('drop', function (event) {
            event.preventDefault();
            event.stopPropagation();
            throttledDragoverCallback.cancel();
            _setDropIndicatorPos();

            if ($(event.target).is(_this3.$element)) {
              var pos = _this3.mapper.px2pos({
                left: event.offsetX,
                top: event.offsetY
              });

              var layout = Object.assign(pos, _this3.container.getWidthAtPos(pos));
              layout.height = _this3.mapper.minHeight;
              if (layout.width >= _this3.mapper.minWidth) {
                layout.width = Math.min(layout.width, _this3.mapper.numColumns - layout.left);
                var adjustedLayout = _this3.mapper.checkPositionConstraints(layout);
                _this3.createElementsAtPosition({ event: event, dimensions: adjustedLayout });
              }
            }
          });
        }

        /**
         * Adds a click listener to the container to identify selected items. Adds
         * a class 'fl-item-selected' on the selected item.
         */

      }, {
        key: 'setupVisitListeners',
        value: function setupVisitListeners($document, $scope) {
          function onClick(event) {
            var item = $(event.target).closest('[fl-item]').eq(0);

            if (item) {
              item.addClass('fl-item-selected');
            }

            $('[fl-item]').not(item).removeClass('fl-item-selected');
          }

          $document.on('click', onClick);

          $scope.$on('$destroy', function () {
            $document.off('click', onClick);
          });
        }
      }]);

      return FlContainer;
    }()]
  };
};

var _lodash = __webpack_require__(4);

var _lodash2 = _interopRequireDefault(_lodash);

var _Container = __webpack_require__(5);

var _Container2 = _interopRequireDefault(_Container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = _;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Row = __webpack_require__(6);

var _Row2 = _interopRequireDefault(_Row);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Container = function () {
  function Container() {
    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Container);

    this.rows = this.itemsToRows(items);
  }

  _createClass(Container, [{
    key: 'itemsToRows',
    value: function itemsToRows(items) {
      var _this = this;

      var topMap = {};

      items.forEach(function (item) {
        if (item.top in topMap) {
          topMap[item.top].push(item);
        } else {
          topMap[item.top] = [item];
        }
      });

      return Object.entries(topMap).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            top = _ref2[0],
            items = _ref2[1];

        return new _Row2.default(items, Number(top), _this);
      }).sort(function (a, b) {
        return a.top - b.top;
      });
    }
  }, {
    key: 'addItem',
    value: function addItem(item) {
      var rowIndex = void 0,
          itemRow = void 0;

      // Push the item down till it does not overlap with a row above it
      for (rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
        if (this.rows[rowIndex].top < item.top) {
          item.top += this.rows[rowIndex].getOverlap(item, false);
        } else {
          if (this.rows[rowIndex].top === item.top) {
            itemRow = this.rows[rowIndex];
          }
          break;
        }
      }

      // If a row is already present with which it does not overlap, add it there
      if (itemRow && !itemRow.getOverlap(item, true)) {
        itemRow.addItem(item);
      } else {
        // Else create a new row before the currently reached index
        this.rows.splice(rowIndex, 0, new _Row2.default([item], item.top, this));
      }

      // Iterate through all the remaining rows and push them by the amount of overlap
      for (var i = rowIndex + 1; i < this.rows.length; i++) {
        this.shiftRows(this.rows.slice(i), this.rows[i].getOverlap(item, true));
      }
    }
  }, {
    key: 'editItem',
    value: function editItem(item, newLayout) {
      this.removeItem(item);
      this.addItem(Object.assign(item, newLayout));
    }
  }, {
    key: 'removeItem',
    value: function removeItem(item) {
      var row = item.row;
      row.removeItem(item);

      // Remove row if empty
      if (row.items.length === 0) {
        this.rows.splice(this.rows.indexOf(row), 1);
      }
    }
  }, {
    key: 'shiftRows',
    value: function shiftRows(rows, diff) {
      rows.forEach(function (row) {
        return row.setTop(row.top + diff);
      });
    }
  }, {
    key: 'removeGaps',
    value: function removeGaps() {
      if (this.rows.length === 0) {
        return;
      }

      if (this.rows[0].top !== 0) {
        this.shiftRows(this.rows, -this.rows[0].top);
      }

      var maxTop = 0;

      for (var i = 1; i < this.rows.length; i++) {
        maxTop = Math.max(maxTop, this.rows[i - 1].top + this.rows[i - 1].getHeight());
        var gap = this.rows[i].top - maxTop;
        if (gap > 0) {
          this.shiftRows(this.rows.slice(i), -gap);
        }
      }
    }
  }, {
    key: 'getMaxHeight',
    value: function getMaxHeight() {
      return this.rows.reduce(function (sum, row) {
        return Math.max.apply(Math, _toConsumableArray([sum].concat(row.items.map(function (item) {
          return item.top + item.height;
        }))));
      }, 0);
    }
  }, {
    key: 'getClosestTop',
    value: function getClosestTop(layout) {
      if (this.rows.length === 0) {
        layout.top = 0;
      } else {
        for (var i = this.rows.length - 1; i >= 0; i--) {
          if (this.rows[i].top < layout.top) {
            layout.top = this.rows[i].top;
            layout.top += this.rows[i].getOverlap(layout, false);
            break;
          }
        }
      }

      return layout;
    }
  }, {
    key: 'getWidthAtPos',
    value: function getWidthAtPos(_ref3) {
      var left = _ref3.left,
          top = _ref3.top;

      var leftSide = 0,
          rightSide = Infinity;

      this.rows.forEach(function (row) {
        if (row.top >= top) {
          return false;
        }

        row.items.forEach(function (item) {
          if (item.top + item.height > top) {
            if (item.left < left) {
              leftSide = Math.max(leftSide, item.left + item.width);
            } else {
              rightSide = Math.min(rightSide, item.left);
            }
          }
        });
      });

      return {
        left: leftSide,
        width: rightSide - leftSide
      };
    }
  }]);

  return Container;
}();

exports.default = Container;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Row = function () {
  function Row(items, top) {
    var _this = this;

    _classCallCheck(this, Row);

    this.top = top;

    this.items = items;
    items.forEach(function (item) {
      return item.row = _this;
    });
  }

  _createClass(Row, [{
    key: "addItem",
    value: function addItem(item) {
      this.items.push(item);
      item.row = this;
    }
  }, {
    key: "removeItem",
    value: function removeItem(item) {
      var index = this.items.indexOf(item);
      item.row = null;
      this.items.splice(index, 1);
    }
  }, {
    key: "setTop",
    value: function setTop(top) {
      var _this2 = this;

      this.top = top;
      this.items.forEach(function (item) {
        return item.top = _this2.top;
      });
    }
  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.items.reduce(function (max, item) {
        return Math.max(max, item.height);
      }, 0);
    }
  }, {
    key: "getOverlap",
    value: function getOverlap(other, otherOnTop) {
      var overlap = 0;

      this.items.forEach(function (item) {
        if (item.doesOverlap(other)) {
          if (otherOnTop) {
            overlap = Math.max(overlap, other.top + other.height - item.top);
          } else {
            overlap = Math.max(overlap, item.top + item.height - other.top);
          }
        }
      });

      return overlap;
    }
  }]);

  return Row;
}();

exports.default = Row;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

/**
 * This directive behaves as a viewController, creating a link from the element
 * (the view) to the model.
 */


exports.default = function () {
  return {
    restrict: 'A',
    require: ['^flContainer', 'flItem'], //This creates a self reference, not sure if it is an issue
    bindToController: {
      layout: '=flItem',
      resizable: '=flResizable',
      getHeight: '=flGetHeight',
      lastRepeat: '=flLastRepeat',
      isEditable: '=flEditable'
    },
    controllerAs: 'flItem',
    controller: ['$element', 'flMapper', function () {
      function FlItem($element, flMapper) {
        _classCallCheck(this, FlItem);

        this.$element = $element;
        this.mapper = flMapper;
        this.item = new _Item2.default(this.layout.left, this.layout.top, this.layout.width, this.layout.height);
      }

      _createClass(FlItem, [{
        key: 'render',
        value: function render() {
          this.$element.css(this.mapper.layout2px(this.item));
        }
      }]);

      return FlItem;
    }()],
    link: function link(scope, element, attrs, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          flContainer = _ref2[0],
          flItem = _ref2[1];

      var resizeOption = flItem.resizable; // 0 = not resizable, 1 = sides, 2 = sides + bottom

      flContainer.initItem(flItem);
      element.addClass('fl-item');

      if (flContainer.isEditable) {
        element.addClass('fl-edit');

        scope.$on('$destroy', function () {
          flContainer.onItemRemove(flItem);
        });

        if (flItem.isEditable) {
          makeDraggable();
          makeResizable();
          setItemListeners();
        }
      }

      /**
       * Sets the element as draggable, and while dragging creates a clone whose
       * position and size is set to be what the element would have if dropped
       * at that position
       */
      function makeDraggable() {
        var indicator = $('<' + element[0].nodeName.toLowerCase() + '>').addClass('fl-drag-indicator fl-item');
        var clone = $('<div>').addClass('fl-drag-clone');
        clone.append(indicator);

        var size = {};

        element.draggable({
          cursor: 'move',
          cancel: '[fl-drag-cancel]',
          helper: function helper() {
            return clone;
          },
          start: function start(event) {
            size.width = element.outerWidth();
            size.height = element.outerHeight();

            clone.css(flContainer.mapper.layout2px(flItem.item));
            indicator.css(flContainer.mapper.layout2px(flItem.item));

            element.children().clone().appendTo(indicator);
            flContainer.onItemEditStart();
            scope.$broadcast('flDragStart', event);
          },
          drag: function drag(event, ui) {
            var indicatorPos = flContainer.mapper.layout2px(flContainer.mapper.getClosestPosition(Object.assign(size, ui.position)));

            indicator.css({
              left: indicatorPos.left - ui.position.left,
              top: indicatorPos.top - ui.position.top
            });
          },
          stop: function stop(event, ui) {
            indicator.empty();
            flContainer.onItemEditEnd(flItem.item, flContainer.mapper.getClosestPosition(Object.assign(size, ui.position)));
            scope.$broadcast('flDragStop', event);
          }
        });
      }

      /**
       * Sets the element as resizable, with custom resize handlers.
       * As jQuery does not support a clone object for resizing, a similar object
       * is created on starting the resize and removed on stopping resize, and
       * its position and size during resize are updated to be the allowed
       * positions in the container
       */
      function makeResizable() {
        if (!resizeOption) {
          return;
        }

        var indicator = void 0;

        function getNewLayout(ui) {
          var newLayout = flContainer.mapper.getClosestSize(Object.assign(ui.position, ui.size), element.data('ui-resizable').axis.includes('w'));
          return setMinHeight(newLayout, true);
        }

        element.resizable({
          classes: {
            'ui-resizable-handle': 'fl-resizable',
            'ui-resizable-se': ''
          },
          start: function start(event) {
            indicator = $('<div>').addClass('fl-resize-indicator fl-item');
            indicator.css(flContainer.mapper.layout2px(flItem.item));
            indicator.appendTo('[fl-container]');

            flContainer.onItemEditStart();
            scope.$broadcast('flResizeStart', event);
          },
          resize: function resize(event, ui) {
            indicator.css(flContainer.mapper.layout2px(getNewLayout(ui)));
          },
          stop: function stop(event, ui) {
            indicator.remove();
            flContainer.onItemEditEnd(flItem.item, getNewLayout(ui));
            scope.$broadcast('flResizeStop', event);
          }
        });
        setResizeHandles();
      }

      function setResizeHandles() {
        element.resizable('option', 'handles', resizeOption === 1 ? 'e, w' : 'e, se, s, sw, w');
      }

      function setMinHeight(layout, isFreeSize) {
        if (flItem.getHeight) {
          var pixels = flContainer.mapper.layout2px(layout);
          var contentHeight = flItem.getHeight(element, pixels.width, isFreeSize);

          if (contentHeight > 0 && (resizeOption < 2 || contentHeight > pixels.height)) {
            pixels.height = contentHeight;
            return flContainer.mapper.px2layout(pixels);
          }
        }
        return layout;
      }

      function setItemListeners() {
        scope.$on('flItemChanged', function () {
          var newLayout = setMinHeight(flItem.item, false);
          if (newLayout.height !== flItem.item.height) {
            flContainer.onItemEditEnd(flItem.item, newLayout);
          }
        });

        scope.$on('flResizeChanged', function (event, option) {
          resizeOption = option;
          setResizeHandles();
        });
      }
    }
  };
};

var _Item = __webpack_require__(8);

var _Item2 = _interopRequireDefault(_Item);

__webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Item = function () {
  function Item(left, top, width, height) {
    _classCallCheck(this, Item);

    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.row = null;
  }

  _createClass(Item, [{
    key: "doesOverlap",
    value: function doesOverlap(item) {
      return !(this.left + this.width <= item.left || item.left + item.width <= this.left || this.top + this.height <= item.top || item.top + item.height <= this.top);
    }
  }]);

  return Item;
}();

exports.default = Item;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(10);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./resizable.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./resizable.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".fl-edit.ui-resizable-resizing {\n  display: none;\n}\n\n.fl-resize-indicator {\n  border: 1px solid blue;\n  background-color: blue;\n  opacity: 0.5;\n  z-index: 8;\n}\n\n/* jQuery's autohide option is not working, this fixes that */\n.fl-edit:not(:hover):not(.fl-item-selected) .fl-resizable {\n  display: none !important;\n}\n\n.fl-resizable {\n  background-color: blue;\n  border-radius: 4px;\n  height: 8px;\n  width: 8px;\n  z-index: 8 !important; /* Override ui-resizable's inline style */\n}\n\n.fl-resizable.ui-resizable-e {\n  right: -4px;\n  top: calc(50% - 4px);\n}\n\n.fl-resizable.ui-resizable-se {\n  bottom: -4px;\n  right: -4px;\n}\n\n.fl-resizable.ui-resizable-s {\n  bottom: -4px;\n  left: calc(50% - 4px);\n}\n\n.fl-resizable.ui-resizable-sw {\n  bottom: -4px;\n  left: -4px;\n}\n\n.fl-resizable.ui-resizable-w {\n  left: -4px;\n  top: calc(50% - 4px);\n}\n\n.fl-resizable-helper {\n  border: 2px solid green;\n  position: absolute;\n}\n", ""]);

// exports


/***/ }),
/* 11 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var flMapper = function () {
  function flMapper() {
    _classCallCheck(this, flMapper);
  }

  _createClass(flMapper, [{
    key: "initialize",
    value: function initialize(_ref) {
      var _ref$width = _ref.width,
          width = _ref$width === undefined ? 768 : _ref$width,
          _ref$rowHeight = _ref.rowHeight,
          rowHeight = _ref$rowHeight === undefined ? 15 : _ref$rowHeight,
          _ref$numColumns = _ref.numColumns,
          numColumns = _ref$numColumns === undefined ? 60 : _ref$numColumns,
          _ref$buffer = _ref.buffer,
          buffer = _ref$buffer === undefined ? 4 : _ref$buffer,
          _ref$minHeight = _ref.minHeight,
          minHeight = _ref$minHeight === undefined ? 4 : _ref$minHeight,
          _ref$minWidth = _ref.minWidth,
          minWidth = _ref$minWidth === undefined ? 10 : _ref$minWidth;

      this.width = width;
      this.numColumns = numColumns;
      this.buffer = buffer;
      this.rowHeight = rowHeight;
      this.minHeight = minHeight;
      this.minWidth = minWidth;

      // colWidth and rowHeight include buffer
      this.colWidth = (width - (numColumns - 1) * buffer) / numColumns + buffer;
    }

    // All sides (left, right, top, bottom) are snapped to a grid

  }, {
    key: "px2layout",
    value: function px2layout(_ref2) {
      var left = _ref2.left,
          top = _ref2.top,
          width = _ref2.width,
          height = _ref2.height;

      var pos = this.px2pos({ left: left, top: top });
      var right = Math.ceil((this.left2px(pos.left) + width) / this.colWidth);
      var bottom = Math.ceil((this.top2px(pos.top) + height + this.buffer) / this.rowHeight);

      return {
        left: pos.left,
        top: pos.top,
        width: right - pos.left,
        height: bottom - pos.top
      };
    }
  }, {
    key: "layout2px",
    value: function layout2px(_ref3) {
      var left = _ref3.left,
          top = _ref3.top,
          width = _ref3.width,
          height = _ref3.height;

      return {
        left: this.left2px(left),
        top: this.top2px(top),
        width: this.width2px(width),
        height: this.height2px(height)
      };
    }
  }, {
    key: "px2pos",
    value: function px2pos(_ref4) {
      var left = _ref4.left,
          top = _ref4.top;

      return {
        left: this._closestMultiple(left, this.colWidth),
        top: this._closestMultiple(top, this.rowHeight)
      };
    }
  }, {
    key: "left2px",
    value: function left2px(left) {
      return left * this.colWidth;
    }
  }, {
    key: "top2px",
    value: function top2px(top) {
      return top * this.rowHeight;
    }
  }, {
    key: "width2px",
    value: function width2px(width) {
      return width * this.colWidth - this.buffer;
    }
  }, {
    key: "height2px",
    value: function height2px(height) {
      return height * this.rowHeight - this.buffer;
    }
  }, {
    key: "getClosestPosition",
    value: function getClosestPosition(pixels) {
      return this.checkPositionConstraints(this.px2layout(pixels));
    }
  }, {
    key: "getClosestSize",
    value: function getClosestSize(pixels, axis) {
      return this.checkSizeConstraints(this.px2layout(pixels), axis);
    }
  }, {
    key: "checkPositionConstraints",
    value: function checkPositionConstraints(_ref5) {
      var width = _ref5.width,
          height = _ref5.height,
          left = _ref5.left,
          top = _ref5.top;

      // Right container
      if (left + width > this.numColumns) {
        left = this.numColumns - width;
      }

      // Left container
      if (left < 0) {
        left = 0;
      }

      // Top container
      if (top < 0) {
        top = 0;
      }

      return {
        left: left,
        top: top,
        width: width,
        height: height
      };
    }
  }, {
    key: "checkSizeConstraints",
    value: function checkSizeConstraints(_ref6, isLeft) {
      var width = _ref6.width,
          height = _ref6.height,
          left = _ref6.left,
          top = _ref6.top;

      // Right container
      if (left + width > this.numColumns) {
        width = this.numColumns - left;
      }

      if (left < 0) {
        var right = left + width;
        left = 0;
        width = right - left;
      }

      if (width < this.minWidth) {
        // If it was shrunk from the left handler, then move the leftside back
        if (isLeft) {
          left -= this.minWidth - width;
        }
        width = this.minWidth;
      }

      if (height < this.minHeight) {
        height = this.minHeight;
      }

      return {
        left: left, top: top, width: width, height: height
      };
    }
  }, {
    key: "_closestMultiple",
    value: function _closestMultiple(val, divisor) {
      var result = val / divisor;
      var option1 = Math.floor(result);
      var option2 = Math.ceil(result);
      return result - option1 > option2 - result ? option2 : option1;
    }
  }]);

  return flMapper;
}();

exports.default = flMapper;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./app.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./app.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "main {\n  display: block;\n  font-family: Arial, Helvetica, sans-serif;\n  margin-top: 50px;\n  padding: 1em;\n  text-align: center;\n}\n\nfooter {\n  font-size: .8em;\n  text-align: center;\n}\n\n[fl-container] {\n  box-sizing: content-box;\n  position: relative;\n}\n\n.fl-item {\n  position: absolute;\n}\n\n.ui-draggable.ui-draggable-handle {\n  cursor: move;\n}\n\n.fl-edit [fl-drag-cancel] {\n  cursor: initial;\n}\n\n.fl-edit {\n  border: 1px solid transparent;\n}\n\n.fl-edit:hover, .fl-edit.fl-item-selected {\n  border-color: blue;\n}\n\n/** Draggable */\n\n.fl-drag-clone {\n  position: absolute;\n}\n\n.fl-drag-clone .fl-drag-indicator {\n  background-color: lightblue;\n  opacity: 0.5;\n}\n\n/** Drop */\n\n.fl-drop-indicator {\n  background-color: blue;\n  border-radius: 2px;\n  pointer-events: none;\n  position: absolute;\n  height: 5px;\n}\n", ""]);

// exports


/***/ })
/******/ ]);