import 'jquery-ui-css/core.css';
import 'jquery-ui-css/menu.css';
import 'jquery-ui-css/draggable.css';
import 'jquery-ui-css/theme.css';

import angular from 'angular';

import flContainer from './components/fl-container'
import flItem from './components/fl-item'

import '../style/app.css';

export default angular.module('float', [])
  .component('flContainer', flContainer)
  .component('flItem', flItem);
