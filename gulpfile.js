'use strict';

var browserify = require('browserify'),
    del = require('del'),
    connect = require('gulp-connect'),
    eslint = require('gulp-eslint'),
    glob = require('glob'),
    gulp = require('gulp'),
    karma = require('gulp-karma'),
    mocha = require('gulp-mocha'),
    ngAn = require('gulp-ng-annotate'),
    protractor = require('gulp-protractor').protractor,
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify');

/*
 * Useful tasks:
 * - gulp fast:
 *   - browserification
 *   - no minification, does not start server.
 * - gulp watch:
 *   - starts server with live reload enabled
 *   - no minification
 * - gulp:
 *   - linting
 *   - unit tests
 *   - browserification
 *   - minification and browserification of minified sources
 *   - start server for e2e tests
 *   - run Protractor End-to-end tests
 *   - stop server immediately when e2e tests have finished
 *
 * At development time, you should usually just have 'gulp watch' running in the
 * background all the time. Use 'gulp' before releases.
 */

var liveReload = true;

gulp.task('clean', function() {
  return del([
     './app/ng-an',
     './app/dist'
  ]);
});

gulp.task('lint', function() {
  return gulp.src([
    'gulpfile.js',
    'app/js/**/*.js',
    'test/**/*.js',
    '!app/js/vendor/**',
    '!test/browserified/**',
  ])
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('unit', function () {
  return gulp.src([
    'test/unit/**/*.js'
  ])
  .pipe(mocha({ reporter: 'dot' }));
});

gulp.task('browserify', /*['lint', 'unit'],*/ function() {
  return browserify('./app/js/app.js',{ debug: true})
  .bundle()
  .pipe(source('app.js'))
  .pipe(gulp.dest('./app/dist/'))
  .pipe(connect.reload());
});

gulp.task('ng-an', ['lint', 'unit'], function() {
  return gulp.src([
    'app/js/**/*.js',
    '!app/js/vendor/**',
  ])
  .pipe(ngAn())
  .pipe(gulp.dest('./app/ng-an'));
});

gulp.task('browserify-min', ['ng-an'], function() {
  return browserify('./app/ng-an/app.js')
  .bundle()
  .pipe(source('app.min.js'))
  .pipe(streamify(uglify({ mangle: true })))
  .pipe(gulp.dest('./app/dist/'));
});

gulp.task('browserify-tests', function() {
  var bundler = browserify();
  glob.sync('./test/unit/**/*.js')
  .forEach(function(file) {
    bundler.add(file, { debug: true });
  });
  return bundler
  .bundle()
  .pipe(source('browserified_tests.js'))
  .pipe(gulp.dest('./test/browserified'));
});

gulp.task('karma', ['browserify-tests'], function() {
  return gulp
  .src('./test/browserified/browserified_tests.js')
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run'
  }))
  .on('error', function(err) {
    // Make sure failed tests cause gulp to exit non-zero
    throw err;
  });
});

gulp.task('server', ['browserify'], function() {
  connect.server({
    root: 'app',
    livereload: liveReload
  });
});

gulp.task('e2e', ['server'], function() {
  return gulp.src(['./test/e2e/**/*.js'])
  .pipe(protractor({
    configFile: 'protractor.conf.js',
    args: ['--baseUrl', 'http://127.0.0.1:8080'],
  }))
  .on('error', function(e) { throw e; })
  .on('end', function() {
    connect.serverClose();
  });
});

gulp.task('reload',function(){
  connect.reload();
});

gulp.task('watch', function() {
  gulp.start('server');

  gulp.watch([
    'app/js/**/*.js',
    '!app/js/vendor/**',
    'test/**/*.js'
  ], ['browserify']);

  gulp.watch(['app/**/*.html',
           '!app/js/vendor/**/*.html'], ['reload']);

});

gulp.task('fast',['clean'], function() {
  gulp.start('browserify');
});

gulp.task('default', ['clean'], function() {
  liveReload = false;
  gulp.start('karma', 'browserify', 'browserify-min', 'e2e');
});
