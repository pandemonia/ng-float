import $ from 'jQuery'
import _ from 'lodash'
import Container from '../classes/Container'

export default function () {
  return {
    restrict: 'A',
    bindToController: {
      options: '=flContainer',
      isEditable: '=flEditable',
      createElementsAtPosition: '&flCreateElementsAtPosition'
    },
    controller: ['flMapper', '$element', '$document', '$scope', '$timeout', class FlContainer {
      constructor(flMapper, $element, $document, $scope, $timeout) {
        this.flItems = []
        this.mapper = flMapper.initialize(this.options)
        this.$element = $element
        this.$timeout = $timeout
        this.$element.css('width', this.mapper.width)

        if (this.isEditable) {
          this.setupDropListeners()
          this.setupVisitListeners($document, $scope)
        }

        // Giving a 500ms timeout for ngRepeat items to kick in. If there are no
        // items then it means the container is empty.
        $timeout(() => {
          if (!this.container && this.flItems.length === 0) {
            this.container = new Container()
            this.render()
          }
        }, 500)
      }

      /**
       * Adds an item to the container. If the container is not initiated,
       * it is initiated at the last repeat of the ngRepeat iteration which
       * the items are in.
       */
      initItem(flItem) {
        this.flItems.push(flItem)

        if (this.container) {
          this.container.addItem(flItem.item)
          this.render()
        } else {
          if (flItem.lastRepeat) {
            this.container = new Container(this.flItems.map(flItem => flItem.item))
            this.$timeout(() => {
              this.render()
            })
          }
        }
      }

      render() {
        this.container.removeGaps()
        this.$element.css('height', this.mapper.height2px(this.container.getMaxHeight()) + 100)
        this.flItems.forEach(flItem => flItem.render(this.mapper.layout2px(flItem.item), {
          left: flItem.item.left,
          top: flItem.item.top,
          width: flItem.item.width,
          height: flItem.item.height
        }))
      }

      onItemEditStart() {
        this.$element.addClass('fl-container-editing')
        this.$element.css('height', this.$element.height() + 1000)
      }

      onItemEditEnd(item, layout) {
        this.$element.removeClass('fl-container-editing')
        this.container.editItem(item, layout)
        this.render()
      }

      onItemRemove(flItem) {
        _.remove(this.flItems, v => v === flItem)
        this.container.removeItem(flItem.item)
        this.render()
      }

      getNewItemDimensions(pixels) {
        return this.container.getClosestTop(this.mapper.getClosestPosition(pixels))
      }

      setupDropListeners() {
        function _setDropIndicatorPos(left = -10000, top = -10000, width = 0) {
          dropIndicator.css({
            marginLeft: left,
            marginTop: top,
            width: width
          })
        }

        const dropIndicator = $('<div>').addClass('fl-drop-indicator').appendTo(this.$element)
        _setDropIndicatorPos()

        const throttledDragoverCallback = _.throttle(event => {
          if ($(event.target).is(this.$element)) {
            const pos = this.mapper.px2pos({
              left: event.offsetX,
              top: event.offsetY
            })

            const layout = Object.assign(pos, this.container.getWidthAtPos(pos))
            layout.height = this.mapper.minHeight
            layout.width = Math.min(layout.width, this.mapper.numColumns - layout.left)
            if (layout.width < this.mapper.minWidth) {
              _setDropIndicatorPos()
            } else {
              const pixels = this.mapper.layout2px(this.mapper.checkPositionConstraints(layout))

              _setDropIndicatorPos(pixels.left, pixels.top, pixels.width)
            }
          } else {
            _setDropIndicatorPos()
          }
        }, 50)

        this.$element.on('dragover', event => {
          event.preventDefault()
          event.stopPropagation()
          throttledDragoverCallback(event)
        })

        this.$element.on('dragleave', event => {
          event.preventDefault()
          event.stopPropagation()
          throttledDragoverCallback.cancel()
          _setDropIndicatorPos()
        })

        this.$element.on('drop', event => {
          event.preventDefault()
          event.stopPropagation()
          throttledDragoverCallback.cancel()
          _setDropIndicatorPos()

          if ($(event.target).is(this.$element)) {
            const pos = this.mapper.px2pos({
              left: event.offsetX,
              top: event.offsetY
            })

            const layout = Object.assign(pos, this.container.getWidthAtPos(pos))
            layout.height = this.mapper.minHeight
            if (layout.width >= this.mapper.minWidth) {
              layout.width = Math.min(layout.width, this.mapper.numColumns - layout.left)
              const adjustedLayout = this.mapper.checkPositionConstraints(layout)
              this.createElementsAtPosition({event: event, dimensions: adjustedLayout})
            }
          }
        })
      }

      /**
       * Adds a click listener to the container to identify selected items. Adds
       * a class 'fl-item-selected' on the selected item.
       */
      setupVisitListeners($document, $scope) {
        function onClick(event) {
          const item = $(event.target).closest('[fl-item]').eq(0)

          if (item) {
            item.addClass('fl-item-selected')
          }

          $('[fl-item]').not(item).removeClass('fl-item-selected')
        }

        $document.on('click', onClick)

        $scope.$on('$destroy', () => {
          $document.off('click', onClick)
        })
      }
    }]
  }
}
