export default {
  template: `<fl-item ng-repeat="item in $ctrl.items" item="item">
    <ng-transclude></ng-transclude>
  </fl-item>`,
  transclude: true,
  bindings: {
    items: '='
  },
  controller: function ($element) {
    this.$postLink = () => {
      console.debug('postLink', $element);
    };
  }
};
