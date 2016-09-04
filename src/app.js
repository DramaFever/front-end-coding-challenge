angular.module('weather', ['ngResource'])

.controller('forecast', ['$http', '$scope', function($http, $scope){

  const _this = this;
  var default_city = 'New York, NY';

  // recall the existing city or display the default
  $scope.name = $scope.name || default_city;

  // holds the 48 conditions and their corresponding icons
  _this.conditions = new Array(0);

  /***
   *  there are 48 different condition codes that the api can return
   *  this method makes those conditions and their corresponding icon mapping
   *  available to the rest of the controller
   **/
  $scope.GetConditionMap = function() {
    var success = function(response) {
                    _this.conditions[0] = response.data;
    };
        /* This function is similar in concept as the getWeather function,
        however, it will be slightly different as it will be pulling in data
        that will be pulled from a json file that needs to be put up with the server as
        local files can't be hosted
        */

    var error = function(response) {

    };

    $http.get('conditions.json').then(success, error);
  }

  /***
   *  this method is expected to set the forecast objects
      Future work involves making a successful call to pull in 
      data with the correct id and name
   **/
  $scope.getWeather = function(city) {
    var success = function(response) {
      $http.get("http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='${city}')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys")
          .success(function(data){
          console.debug(data);
          var data = response.data.query.results.channel;
          $scope.city = data.location;
          $scope.item = data.item;
        });

    var error = function(response) {
      
    };

    

  }

  /***
   *  this method is expected to return the icon for the corresponding condition code
   *  from the codeToCondition map file
   **/
  $scope.getIcon = function(code) {
    return _this.conditions.filter(condition == condition.code == code)[0].icon;
  };

  /***
   * load the condition code map
   * this maps the condition code returned from the api to the corresponding icon
   */
  setTimeout(GetConditionMap,         
          5000);

  /***
   * load weather for the default city
   */
  // $scope.getWeather(name);
}]);