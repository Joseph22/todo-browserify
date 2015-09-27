'use strict';

// @ngInject
module.exports = function($scope, ImprintService) {
  $scope.text = ImprintService.getText();
};