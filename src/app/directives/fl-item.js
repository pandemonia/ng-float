import $ from 'jquery';
import 'jquery-ui/draggable';

export default function () {
  return {
    restrict: 'A',
    require: {
      container: '^flContainer',
      item: 'flItem' //This creates a self reference, not sure if it is an issue
    },
    bindToController: {
      layout: '=flItem'
    },
    controllerAs: '$ctrl',
    controller: function ($element) {
      /**
       * Move this item to the position specifiied in it's layout
       */
      this.position = () => {
        $element.css('top', this.layout.top)
          .css('left', this.layout.left)
          .css('width', this.layout.width)
          .css('height', this.layout.height);
      };

      /**
       * Callback after this item has stopped moving.
       */
      this.onStop = (event, ui) => {
        this.layout.top = ui.position.top;
        this.layout.left = ui.position.left;
        this.position();
        this.container.onItemMove();
      };

      /**
       * If one or more expressions in the parentheses are true, there's 
       * no overlapping. If all are false, there must be an overlapping.
       */
      this.doesOverlap = item => {
        return !(this.layout.left + this.layout.width < item.layout.left ||
                 item.layout.left + item.layout.width < this.layout.left ||
                 this.layout.top + this.layout.height < item.layout.top ||
                 item.layout.top + item.layout.height < this.layout.top)
      };
    },
    link: (scope, element, attrs, {container, item}) => {
      element.draggable({
        containment: 'parent',
        stop: item.onStop,
        opacity: 0.7,
        helper: 'clone'
      });

      container.addItem(item);
    }
  };
};
