import $ from 'jquery';
import 'jquery-ui/draggable';

export default function () {
  return {
    restrict: 'A',
    require: {
      container: '^flContainer'
    },
    bindToController: {
      layout: '=flItem'
    },
    controllerAs: '$ctrl',
    controller: function ($element) {
      this.$onInit = () => {
        this.container.addItem(this);
      };

      this.$postLink = () => {
        $element.draggable({
          containment: 'parent',
          stop: this.onStop,
          opacity: 0.7,
          helper: 'clone'
        });
        this.setPosition();
      };

      this.setPosition = () => {
        $element.css('top', this.layout.top)
          .css('left', this.layout.left)
          .css('width', this.layout.width)
          .css('height', this.layout.height);
      };

      this.onStop = (event, ui) => {
        this.layout.top = ui.position.top;
        this.layout.left = ui.position.left;
        this.setPosition();
        this.container.onItemMove();
      };
    },
  };
};
