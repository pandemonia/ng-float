import angular from 'angular';

import { flContainer } from './app/directives/fl-container';
import { flItem } from './app/directives/fl-item';

import { MapperService } from './app/factories/Mapper';

import './styles/app.css';

export default angular.module('float', [])
  .directive('flContainer', flContainer)
  .directive('flItem', flItem)
  .service('Mapper', MapperService)
  .name;
