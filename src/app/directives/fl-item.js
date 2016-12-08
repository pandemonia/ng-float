import $ from 'jquery';
import Item from '../classes/Item'

import '../../style/resizable.css';

import mapService from '../services/map'

/**
 * This directive behaves as a viewController, creating a link from the element
 * (the view) to the model.
 */
export default function () {
  return {
    restrict: 'A',
    require: ['^flContainer', 'flItem'], //This creates a self reference, not sure if it is an issue
    bindToController: {
      layout: '=flItem'
    },
    controllerAs: 'flItem',
    controller: ['$element', function ($element) {
      this.item = new Item(this.layout.left, this.layout.top, this.layout.width, this.layout.height);

      this.render = () => {
        $element.css(mapService.layout2px(this.item));
      }
    }],
    link: function (scope, element, attrs, [flContainer, flItem]) {
      element.addClass('fl-item');
      makeDraggable();
      makeResizable();
      flContainer.initItem(flItem);

      /**
       * Sets the element as draggable, and while dragging creates a clone whose
       * position and size is set to be what the element would have if dropped
       * at that position
       */
      function makeDraggable() {
        const indicator = $('<div>').addClass('fl-drag-indicator fl-item');
        const clone = $('<div>').addClass('fl-drag-clone');
        clone.append(indicator);

        element.draggable({
          cursor: 'move',
          cancel: '[fl-item] > *',
          containment: 'parent',
          start: () => {
            element.children().clone().appendTo(indicator);
          },
          drag: (event, ui) => {
            const indicatorPos = mapService.pos2px(mapService.px2pos(ui.position));
            indicator.css({
              left: indicatorPos.left - ui.position.left,
              top: indicatorPos.top - ui.position.top
            });
          },
          stop: (event, ui) => {
            indicator.empty();
            flContainer.onItemMove(flItem.item, ui.position);
          },
          helper: function () {
            clone.css(mapService.layout2px(flItem.item));
            indicator.css(mapService.layout2px(flItem.item));
            return clone;
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
        let indicator;

        element.resizable({
          containment: 'parent',
          handles: 'e, se, s, sw, w',
          classes: {
            'ui-resizable-handle': 'fl-resizable',
            'ui-resizable-se': ''
          },
          start: () => {
            indicator = $('<div>').addClass('fl-resize-indicator fl-item');
            element.children().clone().appendTo(indicator);
            indicator.css(mapService.layout2px(flItem.item));
            indicator.appendTo('[fl-container]');
          },
          resize: (event, ui) => {
            indicator.css(mapService.layout2px(mapService.px2layout(Object.assign(ui.position, ui.size))));
          },
          stop: (event, ui) => {
            indicator.remove();
            flContainer.onItemResize(flItem.item, Object.assign(ui.position, ui.size));
          }
        });
      }
    }
  };
}
