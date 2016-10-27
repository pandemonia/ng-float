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
          stop: this.onStop
        });
        $element.css('top', this.layout.top)
                .css('left', this.layout.left)
                .css('width', this.layout.width)
                .css('height', this.layout.height);
      };

      this.onStop = () => {
        console.debug(this.layout.top, this.layout.left);
        this.layout.top = $element.position().top;
        this.layout.left = $element.position().left;
        console.debug(this.layout.top, this.layout.left);
        this.container.onItemMove();
      };
    },
  };
};
