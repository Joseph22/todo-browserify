'use strict';

// @ngInject
module.exports = function() {

  var text = 'Example app for using AngularJS with Browserify - ' +
    'by Bastian Krol. Use at your own risk :P -' +
    'Modified and Update by Joseph Perez';

  this.getText = function() {
    return text;
  };

};