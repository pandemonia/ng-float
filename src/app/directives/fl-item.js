// import $ from 'jquery';
import 'jquery-ui/draggable';
import Item from '../classes/Item'

export default function ($parse) {
  return {
    restrict: 'A',
    require: {
      flContainer: '^'
    },
    link: (scope, element, attrs, {flContainer}) => {
      const layout = $parse(attrs.flItem)(scope);
      const item = new Item(layout.left, layout.top, layout.width, layout.height);
      element.draggable({
        cursor: 'move',
        cancel: '[fl-item] > *',
        containment: 'parent',
        stop: (event, ui) => {
          console.debug(event, ui);
          // render();
        },
        helper: 'clone'
      });

      function render() {
        element.css('top', layout.top * 20);
        element.css('left', layout.left * 20);
        element.css('width', layout.width * 20);
        element.css('height', layout.height * 20);
      }

      flContainer.addItem(item);

      render();
    }
  };
}
