import Container from '../classes/Container'

/**
 * TODO:
 * Row wise collision detection and sorting
 * Snap to grid - row wise
 */
export default function () {
  return {
    restrict: 'A',
    bindToController: {
      options: '=',
      isEditable: '='
    },
    require: ['flContainer'],
    controllerAs: 'flContainer',
    controller: function () {
      this.flItems = [];
      this.container = new Container([]);

      this.initItem = flItem => {
        this.container.addItem(flItem.item);
        this.flItems.push(flItem);
      }

      this.render = () => {
        this.flItems.forEach(flItem => flItem.render());
      }

      this.moveItem = (flItem, ui) => {
        console.debug(flItem, ui);
        this.render();
      }
    },
    link: function (scope, element, attrs, [flContainer]) {
      console.debug(flContainer.container);
      flContainer.render();
    }
  }
}
