var app = angular.module('weather', [])

.controller('forecast', function($http, $scope){
// $scope.hello = "testing";
  const _this = this;
  var default_city = 'New York, NY';

  // recall the existing city or display the default
  $scope.name = $scope.name || default_city;

  // holds the 48 conditions and their corresponding icons
  $scope.conditions = [];
    $http.get('./dist/conditions.json').sucess(function(data, status, headers, config) {
      $scope.conditons.push(data);
    _this.conditions
    });
  /***
   *  there are 48 different condition codes that the api can return
   *  this method makes those conditions and their corresponding icon mapping
   *  available to the rest of the controller
   **/
   // $scope.hello = "hi";
  $scope.getConditionMap = function(data) {
    $http.get('conditions.json').then(success, error);
        $scope.condition = data;
        console.debug(data)

    

    
  }

  /***
   *  this method is expected to set the forecast objects
   **/
  $scope.getWeather = function(data) {
    var success = function(response) {
      var data = response.data.query.results.channel;

      $scope.location = data.location;
      $scope.item = data.item;
      console.log(data);
    };

    var error = function(data) {
    };

    $http.get("http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='${city}'')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys")
                .then(success, Error);
  }

  /***
   *  this method is expected to return the icon for the corresponding condition code
   *  from the codeToCondition map file
   **/
  $scope.getIcon = function(data) {
    return $scope.conditions.filter(conditions == conditions.code == conditions.code[0].icon);
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
  $scope.getWeather(name);
});
