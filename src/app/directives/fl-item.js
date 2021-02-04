import 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/resizable';

import 'jquery-ui/themes/base/draggable.css';
import 'jquery-ui/themes/base/resizable.css';

import angular from 'angular';
import { Item } from '../classes/Item'

import '../../styles/resizable.css';
import '../../styles/draggable.css';

/**
 * This directive behaves as a viewController, creating a link from the element
 * (the view) to the model.
 */
export function flItem() {
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
          setItemListeners();
        }
      }

      /**
       * Sets the element as draggable, and while dragging creates a clone whose
       * position and size is set to be what the element would have if dropped
       * at that position
       */
      function makeDraggable() {
        const indicator = angular.element('<' + element[0].nodeName.toLowerCase() + '>').addClass('fl-drag-indicator fl-item');
        const clone = angular.element('<div>').addClass('fl-drag-clone');
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
            indicator = angular.element('<div>').addClass('fl-resize-indicator fl-item');
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

      function setItemListeners() {
        scope.$on('flItemChanged', function () {
          const newLayout = setMinHeight(flItem.item, false);
          if (newLayout.height !== flItem.item.height) {
            flContainer.onItemEditEnd(flItem.item, newLayout);
          }
        });

        scope.$on('flResizeChanged', function(event, option) {
          resizeOption = option;
          setResizeHandles();
        });
      }
    }
  };
}
