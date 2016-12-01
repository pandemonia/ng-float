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
    controller: function () {
      let container = new Container([]);

      this.addItem = item => {
        container.addItem(item);
      };

      // After all the items are added position them
      this.$postLink = function () {
        console.debug(container);
      };
    },
    controllerAs: '$ctrl'
  };
}
