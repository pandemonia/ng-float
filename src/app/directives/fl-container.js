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
    controller: ['Mapper', '$element', class FlContainer {
      constructor(Mapper, $element) {
        this.flItems = [];
        this.container = new Container([]);
        this.mapper = new Mapper(this.options);
        this.$element = $element;
        this.$element.width(this.mapper.width);
      }

      initItem(flItem) {
        this.container.addItem(flItem.item);
        this.flItems.push(flItem);
        this.render();
      }

      render() {
        this.container.removeGaps();
        this.$element.height(this.mapper.height2px(this.container.getMaxHeight()))
        this.flItems.forEach(flItem => flItem.render(this.mapper.layout2px(flItem.item)));
      }

      onItemEditStart() {
        this.$element.height(this.$element.height() + 1000);
      }

      onItemMove(item, position) {
        this.container.editItem(item, this.mapper.px2pos(position));
        this.render();
      }

      onItemResize(item, layout) {
        this.container.editItem(item, this.mapper.px2layout(layout));
        this.render();
      }
    }]
  }
}
