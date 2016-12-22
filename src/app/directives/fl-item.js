import $ from 'jquery';
import Item from '../classes/Item'

import '../../style/resizable.css';

/**
 * This directive behaves as a viewController, creating a link from the element
 * (the view) to the model.
 */
export default function () {
  return {
    restrict: 'A',
    require: ['^flContainer', 'flItem'], //This creates a self reference, not sure if it is an issue
    bindToController: {
      layout: '=flItem',
      resizable: '=flResizable',
      getHeight: '=flGetHeight'
    },
    controllerAs: 'flItem',
    controller: ['$element', class FlItem {
      constructor($element) {
        this.$element = $element;
        this.item = new Item(this.layout.left, this.layout.top, this.layout.width, this.layout.height);
      }

      render(css, updatedLayout) {
        this.$element.css(css);
        Object.assign(this.layout, updatedLayout);
      }
    }],
    link: function (scope, element, attrs, [flContainer, flItem]) {
      element.addClass('fl-item');
      makeDraggable();
      makeResizable(flItem.resizable);
      flContainer.initItem(flItem);

      scope.$on('$destroy', () => {
        flContainer.onItemRemove(flItem.item);
      });

      scope.$on('flItemChanged', function () {
        const newLayout = setMinHeight(flItem.item);
        if (newLayout.height !== flItem.item.height) {
          flContainer.onItemEditEnd(flItem.item, newLayout);
        }
      });

      /**
       * Sets the element as draggable, and while dragging creates a clone whose
       * position and size is set to be what the element would have if dropped
       * at that position
       */
      function makeDraggable() {
        const indicator = $('<div>').addClass('fl-drag-indicator fl-item');
        const clone = $('<div>').addClass('fl-drag-clone');
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
       *
       * @param {Integer} resizable Takes one of three integer values which
       *                            determine the handles being shown
       *                            0 = is not resizable
       *                            1 = is resizable horizontally
       *                            2 = resizable freely
       */
      function makeResizable(resizable = 2) {
        if (!resizable) {
          return;
        }

        let indicator;

        function getNewLayout(ui) {
          const newLayout = flContainer.mapper.getClosestSize(Object.assign(ui.position, ui.size), element.data('ui-resizable').axis.includes('w'));
          return setMinHeight(newLayout);
        }

        element.resizable({
          handles: resizable === 1? 'e, w' : 'e, se, s, sw, w',
          classes: {
            'ui-resizable-handle': 'fl-resizable',
            'ui-resizable-se': ''
          },
          start: (event) => {
            indicator = $('<div>').addClass('fl-resize-indicator fl-item');
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
      }

      function setMinHeight(layout) {
        if (flItem.getHeight) {
          const pixels = flContainer.mapper.layout2px(layout);
          const contentHeight = flItem.getHeight(element, pixels.width);
          if (flItem.resizable <= 1 || contentHeight > pixels.height) {
            pixels.height = contentHeight;
            return flContainer.mapper.px2layout(pixels);
          }
        }
        return layout;
      }
    }
  };
}
