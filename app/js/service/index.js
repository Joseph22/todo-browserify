'use strict';

var serv = require('angular').module('todoApp').service;

serv('ImprintService', require('./imprint'));
serv('TodoService', require('./todos'));