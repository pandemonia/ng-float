import $ from 'jquery';
import 'jquery-ui/draggable';

export default {
  template: `<ng-transclude></ng-transclude>`,
  require: {
    flContainer: '^'
  },
  transclude: true,
  bindings: {
    item: '='
  },
  controller: function ($element) {
    this.$postLink = () => {
      $element.draggable();
      $element.css('top', this.item.top);
      $element.css('left', this.item.left);
      $element.css('width', this.item.width);
      $element.css('height', this.item.height);
    };
  }
};
