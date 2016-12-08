import Container from '../classes/Container'
import mapService from '../services/map'

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
        this.container.removeGaps();
        this.flItems.forEach(flItem => flItem.render());
      }

      this.onItemMove = (item, position) => {
        this.container.editItem(item, mapService.px2pos(position));
        this.render();
      }

      this.onItemResize = (item, layout) => {
        this.container.editItem(item, mapService.px2layout(layout));
        this.render();
      }
    },
    link: function (scope, element, attrs, [flContainer]) {
      flContainer.render();
    }
  }
}
