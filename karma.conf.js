module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    files: [
      {pattern: 'src/**/*.json', included: false},
      'node_modules/karma-read-json/karma-read-json.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.js'
    ],
    preprocessors: {
      'src/**/*.js': ['coverage']
    },
  });
};
