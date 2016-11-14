import 'jquery-ui-css/core.css';
import 'jquery-ui-css/menu.css';
import 'jquery-ui-css/draggable.css';
import 'jquery-ui-css/theme.css';

import angular from 'angular';

import flContainer from './directives/fl-container'
import flItem from './directives/fl-item'
import positionService from './services/position'

import '../style/app.css';

export default angular.module('float', [])
  .directive('flContainer', flContainer)
  .directive('flItem', flItem)
  .service('positionService', positionService);
