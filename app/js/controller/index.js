'use strict';
 
var ctrl = require('angular').module('todoApp').controller;

ctrl('EditTodoCtrl',require('./edit_todo'));
ctrl('FooterCtrl',require('./footer'));
ctrl('TodoCtrl',require('./todo'));
ctrl('TodoListCtrl',require('./todo_list'));
ctrl('ImprintCtrl',require('./imprint'));
