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
      options: '=flContainer',
      isEditable: '='
    },
    controllerAs: 'flContainer',
    controller: ['Mapper', class FlContainer {
      constructor(Mapper) {
        this.flItems = [];
        this.container = new Container([]);
        this.mapper = new Mapper(this.options);
      }

      initItem(flItem) {
        this.container.addItem(flItem.item);
        this.flItems.push(flItem);
        this.render();
      }

      render() {
        this.container.removeGaps();
        this.flItems.forEach(flItem => flItem.render(this.mapper.layout2px(flItem.item)));
      }

      onItemMove (item, position) {
        this.container.editItem(item, this.mapper.px2pos(position));
        this.render();
      }

      onItemResize (item, layout) {
        this.container.editItem(item, this.mapper.px2layout(layout));
        this.render();
      }
    }]
  }
}
