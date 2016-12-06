import $ from 'jquery';
import 'jquery-ui/draggable';
import 'jquery-ui/resizable';
import Item from '../classes/Item'

import '../../style/resizable.css';

export default function (mapService) {
  return {
    restrict: 'A',
    require: ['^flContainer', 'flItem'], //This creates a self reference, not sure if it is an issue
    bindToController: {
      layout: '=flItem'
    },
    controllerAs: 'flItem',
    controller: function ($element) {
      this.item = new Item(this.layout.left, this.layout.top, this.layout.width, this.layout.height);

      this.render = () => {
        $element.css(mapService.layout2px(this.item));
      }
    },
    link: function (scope, element, attrs, [flContainer, flItem]) {
      element.addClass('fl-item');

      (() => {
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
            flContainer.moveItem(flItem, ui);
          },
          helper: function () {
            clone.css(mapService.layout2px(flItem.item));
            indicator.css(mapService.layout2px(flItem.item));
            return clone;
          }
        });
      })();

      (() => {
        const handles = {};
        ['e', 'se', 's', 'sw', 'w'].forEach(direction => {
          handles[direction] = $('<div>')
            .addClass(`ui-resizable-handle ui-resizable-${direction} fl-resizable`)
            .appendTo(element);
        });

        element.resizable({
          containment: 'parent',
          handles,
          start: (...args) => {
            console.debug('start', args);
          },
          stop: (...args) => {
            console.debug('stop', args);
          }
        });
      })();

      flContainer.initItem(flItem);
    }
  }
}
