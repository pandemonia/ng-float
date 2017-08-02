import flContainer from './directives/container'
import flItem from './directives/item'
import flMapper from './services/mapper'

import '../style/app.css'

export default angular.module('float', [])
  .directive('flContainer', flContainer)
  .directive('flItem', flItem)
  .service('flMapper', flMapper)
