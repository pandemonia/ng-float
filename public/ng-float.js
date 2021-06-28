var float = (function (angular, lodash) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var angular__default = /*#__PURE__*/_interopDefaultLegacy(angular);

  class Row {
    constructor(items, top) {
      this.top = top;

      this.items = items;
      items.forEach(item => item.row = this);
    }

    addItem(item) {
      this.items.push(item);
      item.row = this;
    }

    removeItem(item) {
      const index = this.items.indexOf(item);
      item.row = null;
      this.items.splice(index, 1);
    }

    setTop(top) {
      this.top = top;
      this.items.forEach(item => item.top = this.top);
    }

    getHeight() {
      return this.items.reduce((max, item) => {
        return Math.max(max, item.height);
      }, 0);
    }

    getOverlap(other, otherOnTop) {
      let overlap = 0;

      this.items.forEach(item => {
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
  }

  class Container {
    constructor(items = []) {
      let status;
      do {
        items.sort((a, b) => (a.top - b.top) * 10000 + a.left - b.left);
        status = this.positionItems(items);
      } while (status);
      this.rows = this.itemsToRows(items);
    }

    positionItems(items) {
      let isChange = false;
      for (var i=0; i<items.length; i++) {
        for (var j=i+1; j<items.length; j++) {
          if (items[i].doesOverlap(items[j])) {
            if (items[i].top <= items[j].top) {
              items[j].top = items[i].top + items[i].height;
            } else if (items[i].top > items[j].top) {
              items[i].top = items[j].top + items[j].height;
            }
            isChange = true;
            console.warn(items[i], `${i} overlaps ${j}`, items[j]);
          }
        }
      }
      return isChange;
    }

    itemsToRows(items) {
      const topMap = {};

      items.forEach(item => {
        if (item.top in topMap) {
          topMap[item.top].push(item);
        } else {
          topMap[item.top] = [item];
        }
      });

      return Object.entries(topMap).map(([top, items]) => {
        return new Row(items, Number(top), this)
      }).sort((a, b) => a.top - b.top);
    }

    addItem(item) {
      let rowIndex, itemRow;

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
      } else { // Else create a new row before the currently reached index
        this.rows.splice(rowIndex, 0, new Row([item], item.top, this));
      }

      // Iterate through all the remaining rows and push them by the amount of overlap
      for (let i = rowIndex + 1; i < this.rows.length; i++) {
        this.shiftRows(this.rows.slice(i), this.rows[i].getOverlap(item, true));
      }
    }

    editItem(item, newLayout) {
      this.removeItem(item);
      this.addItem(Object.assign(item, newLayout));
    }

    removeItem(item) {
      const row = item.row;
      row.removeItem(item);

      // Remove row if empty
      if (row.items.length === 0) {
        this.rows.splice(this.rows.indexOf(row), 1);
      }
    }

    shiftRows(rows, diff) {
      rows.forEach(row => row.setTop(row.top + diff));
    }

    removeGaps() {
      if (this.rows.length === 0) {
        return;
      }

      if (this.rows[0].top !== 0) {
        this.shiftRows(this.rows, -this.rows[0].top);
      }

      let maxTop = 0;

      for (let i = 1; i < this.rows.length; i++) {
        maxTop = Math.max(maxTop, this.rows[i - 1].top + this.rows[i - 1].getHeight());
        const gap = this.rows[i].top - maxTop;
        if (gap > 0) {
          this.shiftRows(this.rows.slice(i), -gap);
        }
      }
    }

    getMaxHeight() {
      return this.rows.reduce((sum, row) => {
        return Math.max.apply(undefined, [sum].concat(row.items.map(item => item.top + item.height)));
      }, 0);
    }

    getClosestTop(layout) {
      if (this.rows.length === 0) {
        layout.top = 0;
      } else {
        for (let i = this.rows.length - 1; i >= 0; i--) {
          if (this.rows[i].top < layout.top) {
            layout.top = this.rows[i].top;
            layout.top += this.rows[i].getOverlap(layout, false);
            break;
          }
        }
      }

      return layout;
    }

    getWidthAtPos({left, top}) {
      let leftSide = 0, rightSide = Infinity;

      this.rows.forEach(row => {
        if (row.top >= top) {
          return false;
        }

        row.items.forEach(item => {
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
  }

  function flContainer() {
    return {
      restrict: 'A',
      bindToController: {
        options: '=flContainer',
        isEditable: '=flEditable',
        createElementsAtPosition: '&flCreateElementsAtPosition'
      },
      controllerAs: 'flContainer',
      controller: ['Mapper', '$element', '$document', '$scope', '$timeout', class FlContainer {
        constructor(Mapper, $element, $document, $scope, $timeout) {
          this.flItems = [];
          this.Mapper = Mapper;
          this.$element = $element;
          this.$document = $document;
          this.$scope = $scope;
          this.$timeout = $timeout;
        }

        $onInit() {
          this.mapper = new this.Mapper(this.options);
          this.$element.css('width', this.mapper.width);

          if (this.isTouchDevice()) {
            this.$element.addClass('fl-touch');
          }

          if (this.isEditable) {
            this.setupDropListeners();
            this.setupVisitListeners(this.$document, this.$scope);
          }

          // Giving a 500ms timeout for ngRepeat items to kick in. If there are no
          // items then it means the container is empty.
          this.$timeout(() => {
            if (!this.container && this.flItems.length === 0) {
              this.container = new Container();
              this.render();
            }
          }, 500);
        }

        /**
         * Adds an item to the container. If the container is not initiated,
         * it is initiated at the last repeat of the ngRepeat iteration which
         * the items are in.
         */
        initItem(flItem) {
          this.flItems.push(flItem);

          if (this.container) {
            this.container.addItem(flItem.item);
            this.render();
          } else {
            if (flItem.lastRepeat) {
              this.container = new Container(this.flItems.map(flItem => flItem.item));
              this.$timeout(() => {
                this.render();
              });
            }
          }
        }

        render() {
          this.container.removeGaps();
          this.$element.css('height', this.mapper.height2px(this.container.getMaxHeight()) + (this.isEditable ? 100 : 0));
          this.flItems.forEach(flItem => flItem.render(this.mapper.layout2px(flItem.item), {
            left: flItem.item.left,
            top: flItem.item.top,
            width: flItem.item.width,
            height: flItem.item.height
          }));
        }

        onItemEditStart() {
          this.$element.addClass('fl-container-editing');
          this.$element.css('height', this.$element.height() + 1000);
        }

        onItemEditEnd(item, layout) {
          this.$element.removeClass('fl-container-editing');
          this.container.editItem(item, layout);
          this.render();
        }

        onItemRemove(flItem) {
          this.flItems = this.flItems.filter(v => v !== flItem);
          this.container.removeItem(flItem.item);
          this.render();
        }

        getNewItemDimensions(pixels) {
          return this.container.getClosestTop(this.mapper.getClosestPosition(pixels));
        }

        setupDropListeners() {
          function _setDropIndicatorPos(left = -10000, top = -10000, width = 0) {
            dropIndicator.css({
              marginLeft: left,
              marginTop: top,
              width: width
            });
          }

          const dropIndicator = angular__default['default'].element('<div>').addClass('fl-drop-indicator').appendTo(this.$element);
          _setDropIndicatorPos();

          const throttledDragoverCallback = lodash.throttle(event => {
            if (angular__default['default'].element(event.target).is(this.$element)) {
              const pos = this.mapper.px2pos({
                left: event.offsetX,
                top: event.offsetY
              });

              const layout = Object.assign(pos, this.container.getWidthAtPos(pos));
              layout.height = this.mapper.minHeight;
              layout.width = Math.min(layout.width, this.mapper.numColumns - layout.left);
              if (layout.width < this.mapper.minWidth) {
                _setDropIndicatorPos();
              } else {
                const pixels = this.mapper.layout2px(this.mapper.checkPositionConstraints(layout));

                _setDropIndicatorPos(pixels.left, pixels.top, pixels.width);
              }
            } else {
              _setDropIndicatorPos();
            }
          }, 50);

          this.$element.on('dragover', event => {
            event.preventDefault();
            event.stopPropagation();
            throttledDragoverCallback(event);
          });

          this.$element.on('dragleave', event => {
            event.preventDefault();
            event.stopPropagation();
            throttledDragoverCallback.cancel();
            _setDropIndicatorPos();
          });

          this.$element.on('drop', event => {
            event.preventDefault();
            event.stopPropagation();
            throttledDragoverCallback.cancel();
            _setDropIndicatorPos();

            if (angular__default['default'].element(event.target).is(this.$element)) {
              const pos = this.mapper.px2pos({
                left: event.offsetX,
                top: event.offsetY
              });

              const layout = Object.assign(pos, this.container.getWidthAtPos(pos));
              layout.height = this.mapper.minHeight;
              if (layout.width >= this.mapper.minWidth) {
                layout.width = Math.min(layout.width, this.mapper.numColumns - layout.left);
                const adjustedLayout = this.mapper.checkPositionConstraints(layout);
                this.createElementsAtPosition({event: event, dimensions: adjustedLayout});
              }
            }
          });
        }

        /**
         * Adds a click listener to the container to identify selected items. Adds
         * a class 'fl-item-selected' on the selected item.
         */
        setupVisitListeners($document, $scope) {
          function onClick(event) {
            const item = angular__default['default'].element(event.target).closest('[fl-item]').eq(0);

            if (item) {
              item.addClass('fl-item-selected');
            }

            angular__default['default'].element('[fl-item]').not(item).removeClass('fl-item-selected');
          }

          $document.on('click', onClick);

          $scope.$on('$destroy', () => {
            $document.off('click', onClick);
          });
        }

        isTouchDevice() {
          return 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        }
      }]
    }
  }

  class Item {
    constructor(left, top, width, height) {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
      this.row = null;
    }

    doesOverlap(item) {
      return !(this.left + this.width <= item.left || item.left + item.width <= this.left ||
               this.top + this.height <= item.top || item.top + item.height <= this.top);
    }
  }

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z$2 = ":root {\n  --float-body-color: blue;\n  --float-handle-size: 8px;\n}\n\n.fl-touch {\n  --float-handle-size: 20px;\n}\n\n.fl-edit.ui-resizable-resizing {\n  display: none;\n}\n\n.fl-resize-indicator {\n  border: 1px solid var(--float-body-color);\n  background-color: var(--float-body-color);\n  opacity: 0.5;\n  z-index: 8;\n}\n\n/* jQuery's autohide option is not working, this fixes that */\n.fl-edit:not(:hover):not(.fl-item-selected) .fl-resizable {\n  display: none !important;\n}\n\n.fl-resizable {\n  background-color: var(--float-body-color);\n  border-radius: 50%;\n  height: var(--float-handle-size);\n  position: absolute;\n  width: var(--float-handle-size);\n  z-index: 8 !important; /* Override ui-resizable's inline style */\n}\n\n.fl-resizable.ui-resizable-e {\n  cursor: e-resize;\n  right: calc(-1 * var(--float-handle-size)/2);\n  top: calc(50% - var(--float-handle-size)/2);\n}\n\n.fl-resizable.ui-resizable-se {\n  cursor: se-resize;\n  bottom: calc(-1 * var(--float-handle-size)/2);\n  right: calc(-1 * var(--float-handle-size)/2);\n}\n\n.fl-resizable.ui-resizable-s {\n  cursor: s-resize;\n  bottom: calc(-1 * var(--float-handle-size)/2);\n  left: calc(50% - var(--float-handle-size)/2);\n}\n\n.fl-resizable.ui-resizable-sw {\n  cursor: sw-resize;\n  bottom: calc(-1 * var(--float-handle-size)/2);\n  left: calc(-1 * var(--float-handle-size)/2);\n}\n\n.fl-resizable.ui-resizable-w {\n  cursor: w-resize;\n  left: calc(-1 * var(--float-handle-size)/2);\n  top: calc(50% - var(--float-handle-size)/2);\n}\n\n.fl-resizable-helper {\n  border: 2px solid green;\n  position: absolute;\n}\n";
  styleInject(css_248z$2);

  var css_248z$1 = ".ui-draggable.ui-draggable-handle {\n  cursor: move;\n}\n\n.fl-drag-clone {\n  position: absolute;\n}\n\n.fl-drag-clone .fl-drag-indicator {\n  background-color: lightblue;\n  opacity: 0.5;\n}\n";
  styleInject(css_248z$1);

  /**
   * This directive behaves as a viewController, creating a link from the element
   * (the view) to the model.
   */
  function flItem() {
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
      controller: ['$element', '$scope', class FlItem {
        constructor($element, $scope) {
          this.$element = $element;
          this.$scope = $scope;
        }

        $onInit() {
          var dimensions = this.$scope.flContainer.mapper.px2dimension(this.layout);
          this.item = new Item(dimensions.left, dimensions.top, dimensions.width, dimensions.height);
        }

        render(css, updatedLayout) {
          this.$element.css(css);
          Object.assign(this.layout, updatedLayout);
        }
      }],
      link: function (scope, element, attrs, [flContainer, flItem]) {
        var resizeOption = flItem.resizable; // 0 = not resizable, 1 = sides, 2 = sides + bottom

        scope.flContainer = flContainer;
        flContainer.initItem(flItem);
        element.addClass('fl-item');

        if (flContainer.isEditable) {
          element.addClass('fl-edit');

          scope.$on('$destroy', () => {
            flContainer.onItemRemove(flItem);
          });

          if (flItem.isEditable) {
            makeDraggable();
            makeResizable();
          }
        }

        setItemListeners(flItem.isEditable);

        /**
         * Sets the element as draggable, and while dragging creates a clone whose
         * position and size is set to be what the element would have if dropped
         * at that position
         */
        function makeDraggable() {
          const indicator = angular__default['default'].element('<' + element[0].nodeName.toLowerCase() + '>').addClass('fl-drag-indicator fl-item');
          const clone = angular__default['default'].element('<div>').addClass('fl-drag-clone');
          clone.append(indicator);

          const size = {};

          element.draggable({
            cursor: 'move',
            cancel: '[fl-drag-cancel]',
            helper: () => clone,
            start: (event) => {
              size.width = element.outerWidth();
              size.height = element.outerHeight();

              clone.css(flContainer.mapper.layout2px(flItem.item));
              indicator.css(flContainer.mapper.layout2px(flItem.item));

              element.children().clone().appendTo(indicator);
              flContainer.onItemEditStart();
              scope.$broadcast('flDragStart', event);
            },
            drag: (event, ui) => {
              const indicatorPos = flContainer.mapper.layout2px(flContainer.mapper.getClosestPosition(Object.assign(size, ui.position)));

              indicator.css({
                left: indicatorPos.left - ui.position.left,
                top: indicatorPos.top - ui.position.top
              });
            },
            stop: (event, ui) => {
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

          let indicator;

          function getNewLayout(ui) {
            const newLayout = flContainer.mapper.getClosestSize(Object.assign(ui.position, ui.size), element.data('ui-resizable').axis.includes('w'));
            return setMinHeight(newLayout, true);
          }

          element.resizable({
            classes: {
              'ui-resizable-handle': 'fl-resizable',
              'ui-resizable-se': ''
            },
            start: (event) => {
              indicator = angular__default['default'].element('<div>').addClass('fl-resize-indicator fl-item');
              indicator.css(flContainer.mapper.layout2px(flItem.item));
              indicator.appendTo('[fl-container]');

              flContainer.onItemEditStart();
              scope.$broadcast('flResizeStart', event);
            },
            resize: (event, ui) => {
              indicator.css(flContainer.mapper.layout2px(getNewLayout(ui)));
            },
            stop: (event, ui) => {
              indicator.remove();
              flContainer.onItemEditEnd(flItem.item, getNewLayout(ui));
              scope.$broadcast('flResizeStop', event);
            }
          });
          setResizeHandles();
        }

        function setResizeHandles() {
          element.resizable('option', 'handles', resizeOption === 1? 'e, w' : 'e, se, s, sw, w');
        }

        function setMinHeight(layout, isFreeSize) {
          if (flItem.getHeight) {
            const pixels = flContainer.mapper.layout2px(layout);
            const contentHeight = flItem.getHeight(element, pixels.width, isFreeSize);

            if (contentHeight > 0 && (resizeOption < 2 || contentHeight > pixels.height)) {
              pixels.height = contentHeight;
              return flContainer.mapper.px2layout(pixels);
            }
          }
          return layout;
        }

        /**
         * The item content can be created programmatically, and not directly through float.
         * In such cases, it is possible that the item size needs to be calculated on load
         * and thus needs to listen to item changes even without the item being editable.
         *
         * @param {boolean} isEditable
         */
        function setItemListeners(isEditable) {
          scope.$on('flItemChanged', function () {
            const newLayout = setMinHeight(flItem.item, false);
            if (newLayout.height !== flItem.item.height) {
              flContainer.onItemEditEnd(flItem.item, newLayout);
            }
          });

          if (isEditable) {
            scope.$on('flResizeChanged', function(event, option) {
              resizeOption = option;
              setResizeHandles();
            });
          }
        }
      }
    };
  }

  class Mapper {
    constructor({width = 768, rowHeight = 15, numColumns = 60, buffer = 4, minHeight = 4, minWidth = 10}) {
      this.width = width;
      this.numColumns = numColumns;
      this.buffer = buffer;
      this.rowHeight = rowHeight;
      this.minHeight = minHeight;
      this.minWidth = minWidth;

      // colWidth and rowHeight include buffer
      this.colWidth = (width - (numColumns - 1) * buffer)/numColumns + buffer;
    }

    /** All sides (left, right, top, bottom) are snapped to a grid */
    px2layout({left, top, width, height}) {
      const pos = this.px2pos({left, top});
      const right = Math.ceil((this.left2px(pos.left) + width)/this.colWidth);
      const bottom = Math.ceil((this.top2px(pos.top) + height + this.buffer)/this.rowHeight);

      return {
        left: pos.left,
        top: pos.top,
        width: right - pos.left,
        height: bottom - pos.top,
      };
    }

    layout2px({left, top, width, height}) {
      return {
        left: this.left2px(left),
        top: this.top2px(top),
        width: this.width2px(width),
        height: this.height2px(height)
      };
    }

    px2pos({left, top}) {
      return {
        left: this._closestMultiple(left, this.colWidth),
        top: this._closestMultiple(top, this.rowHeight)
      };
    }

    left2px(left) {
      return left * this.colWidth;
    }

    top2px(top) {
      return top * this.rowHeight;
    }

    width2px(width) {
      return width * this.colWidth - this.buffer;
    }

    height2px(height) {
      return height * this.rowHeight -  this.buffer;
    }

    getClosestPosition(pixels) {
      return this.checkPositionConstraints(this.px2layout(pixels));
    }

    getClosestSize(pixels, axis) {
      return this.checkSizeConstraints(this.px2layout(pixels), axis);
    }

    checkPositionConstraints({width, height, left, top}) {
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
        left,
        top,
        width,
        height
      };
    }

    checkSizeConstraints({width, height, left, top}, isLeft) {
      // Right container
      if (left + width > this.numColumns) {
        width = this.numColumns - left;
      }

      if (left < 0) {
        const right = left + width;
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
        left, top, width, height
      };
    }

    px2dimension({left, top, height, width}) {
      if(typeof left === "string" && left.includes('px')) {
        left = this._closestMultiple(parseInt(left), this.colWidth);
      }

      if(typeof top === "string" && top.includes('px')) {
        top = this._closestMultiple(parseInt(top), this.rowHeight);
      }

      if(typeof height === "string" && height.includes('px')) {
        height = this._closestMultiple(parseInt(height), this.rowHeight);
      }

      if(typeof width === "string" && width.includes('px')) {
        width = this._closestMultiple(parseInt(width), this.colWidth);
      }

      return {left,top,height,width};
    }

    _closestMultiple(val, divisor) {
      const result = val/divisor;
      const option1 = Math.floor(result);
      const option2 = Math.ceil(result);
      return result - option1 > option2 - result? option2 : option1;
    }
  }

  function MapperService() {
    return Mapper;
  }

  var css_248z = ":root {\n  --float-body-color: blue;\n}\n\n[fl-container] {\n  box-sizing: content-box;\n  position: relative;\n}\n\n.fl-item {\n  position: absolute;\n}\n\n.fl-edit [fl-drag-cancel] {\n  cursor: initial;\n}\n\n.fl-edit {\n  border: 1px solid transparent;\n}\n\n.fl-edit:hover, .fl-edit.fl-item-selected {\n  border-color: var(--float-body-color);\n}\n\n/** Drop */\n\n.fl-drop-indicator {\n  background-color: var(--float-body-color);\n  border-radius: 2px;\n  pointer-events: none;\n  position: absolute;\n  height: 5px;\n}\n";
  styleInject(css_248z);

  var main = angular__default['default'].module('float', [])
    .directive('flContainer', flContainer)
    .directive('flItem', flItem)
    .service('Mapper', MapperService)
    .name;

  return main;

}(angular, _));
//# sourceMappingURL=ng-float.js.map
