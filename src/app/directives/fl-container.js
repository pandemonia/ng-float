import $ from 'jquery';
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
        this.$element.css('width', this.mapper.width);
        this.setDefaultStyles();
      }

      initItem(flItem) {
        this.container.addItem(flItem.item);
        this.flItems.push(flItem);
        this.render();
      }

      render() {
        this.container.removeGaps();
        this.$element.css('height', this.mapper.height2px(this.container.getMaxHeight()) + 100)
        this.flItems.forEach(flItem => flItem.render(this.mapper.layout2px(flItem.item)));
      }

      onItemEditStart() {
        this.$element.css('height', this.$element.height() + 1000);
      }

      onItemEditEnd(item, layout) {
        this.container.editItem(item, this.mapper.px2layout(layout));
        this.render();
      }

      onItemRemove(item) {
        this.container.removeItem(item);
        this.render();
      }

      setDefaultStyles() {
        $(`<style>
            .fl-item > *:not(.ui-resizable-handle) {
              margin: ${this.mapper.dragBuffer}px;
              width: calc(100% - ${this.mapper.dragBuffer * 2}px);
              height: calc(100% - ${this.mapper.dragBuffer * 2}px);
            }
          </style>`
        ).appendTo('head');
      }

    }]
  }
}
