// import $ from 'jquery';
import 'jquery-ui/draggable';
import Item from '../classes/Item'

export default function () {
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
        $element.css('top', this.item.top * 20);
        $element.css('left', this.item.left * 20);
        $element.css('width', this.item.width * 20);
        $element.css('height', this.item.height * 20);
      }
    },
    link: function (scope, element, attrs, [flContainer, flItem]) {
      element.draggable({
        cursor: 'move',
        cancel: '[fl-item] > *',
        containment: '[fl-container]',
        stop: (event, ui) => {
          flContainer.moveItem(flItem, ui);
        },
        helper: 'clone'
      });

      flContainer.initItem(flItem);
    }
  }
}
