import angular from 'angular';

import flContainer from './directives/fl-container';
import flItem from './directives/fl-item';

import Mapper from './factories/Mapper';

import '../style/app.css';

export default angular.module('float', [])
  .directive('flContainer', flContainer)
  .directive('flItem', flItem)
  .factory('Mapper', Mapper);
