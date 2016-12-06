import Container from '../classes/Container'

/**
 * TODO:
 * Row wise collision detection and sorting
 * Snap to grid - row wise
 */
export default function (mapService) {
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

      this.onItemMove = (item, position) => {
        Object.assign(item, mapService.px2pos(position));
        this.render();
      }

      this.onItemResize = (item, layout) => {
        Object.assign(item, mapService.px2layout(layout));
        this.render();
      }
    },
    link: function (scope, element, attrs, [flContainer]) {
      flContainer.render();
    }
  }
}
