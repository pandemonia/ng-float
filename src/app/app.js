// import 'jquery-ui-css/core.css';
// import 'jquery-ui-css/menu.css';
// import 'jquery-ui-css/draggable.css';
// import 'jquery-ui-css/resizable.css';
// import 'jquery-ui-css/theme.css';

import flContainer from './directives/fl-container'
import flItem from './directives/fl-item'

import flMapper from './factories/Mapper'

import '../style/app.css'

export default angular.module('float', [])
  .directive('flContainer', flContainer)
  .directive('flItem', flItem)
  .service('flMapper', flMapper)
