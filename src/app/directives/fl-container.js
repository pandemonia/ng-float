import $ from 'jQuery';
import _ from 'lodash';
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
      isEditable: '=',
      createElementsAtPosition: '&flCreateElementsAtPosition'
    },
    controllerAs: 'flContainer',
    controller: ['Mapper', '$element', class FlContainer {
      constructor(Mapper, $element) {
        this.flItems = [];
        this.container = new Container([]);
        this.mapper = new Mapper(this.options);
        this.$element = $element;
        this.$element.css('width', this.mapper.width);
        this.setupDropListeners();
      }

      initItem(flItem) {
        this.container.addItem(flItem.item);
        this.flItems.push(flItem);
        this.render();
      }

      render() {
        this.container.removeGaps();
        this.$element.css('height', this.mapper.height2px(this.container.getMaxHeight()) + 100)
        this.flItems.forEach(flItem => flItem.render(this.mapper.layout2px(flItem.item), {
          left: flItem.item.left,
          top: flItem.item.top,
          width: flItem.item.width,
          height: flItem.item.height
        }));
      }

      onItemEditStart() {
        this.$element.css('height', this.$element.height() + 1000);
      }

      onItemEditEnd(item, layout) {
        this.container.editItem(item, layout);
        this.render();
      }

      onItemRemove(item) {
        this.container.removeItem(item);
        this.render();
      }

      getNewItemDimensions(pixels) {
        return this.container.getClosestTop(this.mapper.getClosestPosition(pixels));
      }

      setupDropListeners() {
        function _setDropIndicatorPos(left = -10000, top = -10000, width = 0) {
          dropIndicator.css({
            marginLeft: left,
            marginTop: top,
            width: width
          });
        }

        const dropIndicator = $('<div>').addClass('fl-drop-indicator').appendTo(this.$element);
        _setDropIndicatorPos();

        const throttledDragoverCallback = _.throttle(event => {
          if ($(event.target).is(this.$element)) {
            const pos = this.mapper.px2pos({
              left: event.offsetX,
              top: event.offsetY
            });

            const layout = Object.assign(pos, this.container.getWidthAtPos(pos));
            layout.height = this.mapper.minHeight;
            layout.width = Math.min(layout.width, this.mapper.numColumns - layout.left);
            if (layout.width < this.mapper.minWidth) {
              _setDropIndicatorPos();
            } else {
              const pixels = this.mapper.layout2px(this.mapper.checkPositionConstraints(layout));

              _setDropIndicatorPos(pixels.left, pixels.top, pixels.width);
            }
          } else {
            _setDropIndicatorPos();
          }
        }, 50);

        this.$element.on('dragover', event => {
          event.preventDefault();
          event.stopPropagation();
          throttledDragoverCallback(event);
        });

        this.$element.on('dragleave', event => {
          event.preventDefault();
          event.stopPropagation();
          throttledDragoverCallback.cancel();
          _setDropIndicatorPos();
        });

        this.$element.on('drop', event => {
          event.preventDefault();
          event.stopPropagation();
          throttledDragoverCallback.cancel();
          _setDropIndicatorPos();

          if ($(event.target).is(this.$element)) {
            const pos = this.mapper.px2pos({
              left: event.offsetX,
              top: event.offsetY
            });

            const layout = Object.assign(pos, this.container.getWidthAtPos(pos));
            layout.height = this.mapper.minHeight;
            if (layout.width >= this.mapper.minWidth) {
              layout.width = Math.min(layout.width, this.mapper.numColumns - layout.left);
              const adjustedLayout = this.mapper.checkPositionConstraints(layout);
              this.createElementsAtPosition({event: event, dimensions: adjustedLayout});
            }
          }
        });
      }
    }]
  }
}
