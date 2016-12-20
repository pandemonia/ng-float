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

      render(css) {
        this.$element.css(css);
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
        console.debug('flItemChanged called on ', element, flItem.item);
        console.debug(flItem.getHeight(element));
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
          cancel: '[fl-item] > *',
          helper: () => clone,
          start: () => {
            size.width = element.outerWidth();
            size.height = element.outerHeight();

            clone.css(flContainer.mapper.layout2px(flItem.item));
            indicator.css(flContainer.mapper.layout2px(flItem.item));

            element.children().clone().appendTo(indicator);
            flContainer.onItemEditStart();
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

        element.resizable({
          handles: resizable === 1? 'e, w' : 'e, se, s, sw, w',
          classes: {
            'ui-resizable-handle': 'fl-resizable',
            'ui-resizable-se': ''
          },
          start: () => {
            indicator = $('<div>').addClass('fl-resize-indicator fl-item');
            element.children().clone().appendTo(indicator);
            indicator.css(flContainer.mapper.layout2px(flItem.item));
            indicator.appendTo('[fl-container]');

            flContainer.onItemEditStart();
          },
          resize: (event, ui) => {
            if (flItem.getHeight) {
              console.debug(flItem.getHeight(element, ui.size.width));
            }
            indicator.css(flContainer.mapper.layout2px(flContainer.mapper.getClosestSize(Object.assign(ui.position, ui.size), element.data('ui-resizable').axis.includes('w'))));
          },
          stop: (event, ui) => {
            indicator.remove();
            flContainer.onItemEditEnd(flItem.item, flContainer.mapper.getClosestSize(Object.assign(ui.position, ui.size), element.data('ui-resizable').axis.includes('w')));
          }
        });
      }
    }
  };
}
