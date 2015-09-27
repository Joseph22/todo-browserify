'use strict';

// @ngInject
module.exports = function($scope, TodoService) {
  $scope.todo = TodoService.getTodos()[0];
};
