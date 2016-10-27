export default function () {
  return {
    restrict: 'A',
    controller: function () {
      this.items = [];
      this.addItem = item => {
        console.debug('addItem', item, performance.now());
      };
      this.onItemMove = () => {
        console.debug('onItemMove');
      };
    }
  };
};
