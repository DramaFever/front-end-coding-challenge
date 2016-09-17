var weatherApp = angular.module('weather', []);

weatherApp.controller('forecast', ['$http', '$scope', function($http, $scope){

  const _this = this;
  var default_city = 'New York, NY';

  // recall the existing city or display the default
  $scope.name = $scope.name || default_city;

  // holds the 48 conditions and their corresponding icons
  _this.conditions = new Array(12);

  /***
   *  there are 48 different condition codes that the api can return
   *  this method makes those conditions and their corresponding icon mapping
   *  available to the rest of the controller
   **/
  var GetConditionMap = function() {
    var success = function(response) {
                    _this.conditions = response.data;
    };

    const error = function(response) {

    };

    //$http.get('C:/Users/desti/Downloads/front-end-coding-challenge-master/src/conditions.json').then(success, error);
    $http.get('http://localhost:8080/src/conditions.json').then(success, error);
  }

  /***
   *  this method is expected to set the forecast objects
   **/
  $scope.getWeather = function(city) {
    var success = function(response) {
      var data = response.data.query.results.channel;

      $scope.location = data.location;
      $scope.item = data.item;
    };

    var Error = function(response) {
    };

    $http.get(`http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${city}")&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`)
                .then(success, Error);
  }

  /***
   *  this method is expected to return the icon for the corresponding condition code
   *  from the codeToCondition map file
   **/
  $scope.getIcon = function(code) {
    if(_this.conditions[0])
     return _this.conditions.filter(condition => condition.code == code)[0].icon;
  };

  /***
   * load the condition code map
   * this maps the condition code returned from the api to the corresponding icon
   */
  setTimeout(GetConditionMap,         
          500);

  /***
   * load weather for the default city
   */
   $scope.getWeather($scope.name);
}]);
