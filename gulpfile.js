'use strict';

/***
 *  gmlevit
 Fixed syntax errors:
 - changed const and let to var
 - changed arrow functions to "traditional" syntax
**/

var gulp = require('gulp');
var pkg = require('./package.json');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var karmaServer = require('karma').Server;

gulp.task('build', ['build:html', 'build:js', 'build:json', 'build:sass', 'build:libs']);
gulp.task('watch2', ['build', 'watch:tests', 'watch:src', 'serve']);

/***
 *  Output a summary of unit test code coverage
 **/
gulp.task('test:coverage', function(done) {
  new karmaServer({
    configFile: __dirname + '/karma.conf.js',
singleRun: true,
reporters: ['coverage'],
coverageReporter: {
        type: ['text-summary'],
      }
  }, done).start();

  return;
});

/***
 *  Generate an HTML report that details coverage
 **/
gulp.task('test:report', function(done) {
  new karmaServer({
    configFile: __dirname + '/karma.conf.js',
      singleRun: true,
      reporters: ['coverage'],
      coverageReporter: {
        type: ['html'],
      }
  }, done).start();

  return;
});

/***
 *  Run the project with BrowserSync
 **/
gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });

  gulp.watch(['./dist/**/*.js', './dist/**/*.html'], browserSync.reload);
});

/***
 *  Reload or stream changes to browsers with BrowserSync
 **/
gulp.task('watch:src', function () {
  gulp.watch('./src/**/*.scss', ['build:sass']);
  gulp.watch('./src/**/*.js', ['lint', 'build:js'], browserSync.reload);
  gulp.watch('./src/**/*.json', ['build:json'], browserSync.reload);
  gulp.watch('./src/**/*.html', ['build:html'], browserSync.reload);
});

/***
 *  Run test suite when affected source files change
 **/
gulp.task('watch:tests',
  function (done) {
  new karmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    reporters: ['progress'],
  }, done).start();
});

/***
 *  ESLint
 **/
gulp.task(
  'lint',  function() {
  var eslint = plugins.eslint;

  gulp.src(['./src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/***
 *  Copy the HTML files into the DIST folder
 **/
gulp.task('build:html', function() {
  gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist'));
});

/***
 *  Copy the JSON files into the DIST folder
 **/
gulp.task('build:json', function() {
  gulp.src('./src/**/*.json')
    .pipe(gulp.dest('./dist'));
});

/***
 *  Build all Sass files into a single css file
 **/
gulp.task('build:sass', function() {
  gulp.src('./src/app.scss')
    .pipe(plugins.sass.sync())
    .pipe(plugins.rename(pkg.name + '.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

/***
 *  Build all JS files into a single application file
 **/
gulp.task('build:js', function() {
  var filename = pkg.name + '.js';
  var filenameMinified = pkg.name + '.min.js';

  gulp.src(['!./src/**/*.spec.js', './src/**/*.js'])
    // .pipe(plugins.plumber())

    .pipe(plugins.concat(filename))
    .pipe(gulp.dest('./dist'))
});

/***
 *  Copy all dependencies into the DIST folder
 **/
gulp.task('build:libs', function() {
  gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles({
      overrides: {
        "font-awesome": { main: ['./css/font-awesome.css'] }
      }
    }))
    .pipe(gulp.dest('./dist/libs'));
});

/***
 *  gmlevit: Added default task
 **/
gulp.task('default', ['build','watch2']);
