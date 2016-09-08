angular.module('weather', [])

.controller('forecast', ['$http', '$scope', function($http, $scope){

  var _this = this;
  var default_city = 'New York, NY';

  // recall the existing city or display the default
  $scope.name = $scope.name || default_city;
  $scope.error = { show: false };
  // holds the 48 conditions and their corresponding icons
  _this.conditions = new Array();

  /***
   *  there are 48 different condition codes that the api can return
   *  this method makes those conditions and their corresponding icon mapping
   *  available to the rest of the controller
   **/
  var GetConditionMap = function() {
    var success = function(response) {
      _this.conditions = response.data;
    };

    var error = function(response) {
      console.log("Error loading conditions json.");
    };

    $http.get('conditions.json').then(success, error);
  }

  /***
   *  this method is expected to set the forecast objects
   **/
  $scope.getWeather = function(city) {
    if (city && city != "")
    {
      $scope.error.show = false;
      $scope.showMenu = false;
      var success = function(response) {
        var data = response.data.query.results.channel;

        $scope.location = data.location;
        $scope.item = data.item;
      };

      var error = function(response) {
        console.log("Error loading weather data.");
      };

      $http.get('http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + city + '")&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
                  .then(success, error);
    }
    else
    {
      $scope.error.show = true;
    }
  }

  /***
   *  this method is expected to return the icon for the corresponding condition code
   *  from the codeToCondition map file
   **/
  $scope.getIcon = function(code) {
    try
    {
      var filtered = _this.conditions.filter(function(el) {
        if (el.code == code) return true;
      })[0].icon;

      // If you want to see the result, just check the log
      // console.log(filtered);
      return filtered;
    }
    catch (error)
    {
      // console.log(error);
    }
  };

  /***
   * load the condition code map
   * this maps the condition code returned from the api to the corresponding icon
   */
  
  GetConditionMap();
}]);
