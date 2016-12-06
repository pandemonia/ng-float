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
            flContainer.onItemMove(flItem.item, ui.position);
          },
          helper: function () {
            clone.css(mapService.layout2px(flItem.item));
            indicator.css(mapService.layout2px(flItem.item));
            return clone;
          }
        });
      })();

      (() => {
        let indicator;
        element.resizable({
          containment: 'parent',
          handles: 'e, se, s, sw, w',
          classes: {
            'ui-resizable-handle': 'fl-resizable',
          },
          start: () => {
            indicator = $('<div>').addClass('fl-resize-indicator fl-item');
            element.children().clone().appendTo(indicator);
            indicator.css(mapService.layout2px(flItem.item));
            indicator.appendTo($('[fl-container]'));
          },
          resize: (event, ui) => {
            indicator.css(mapService.layout2px(mapService.px2layout(Object.assign(ui.position, ui.size))));
          },
          stop: (event, ui) => {
            indicator.remove();
            flContainer.onItemResize(flItem.item, Object.assign(ui.position, ui.size));
          }
        });
      })();

      flContainer.initItem(flItem);
    }
  }
}
