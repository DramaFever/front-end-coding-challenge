(function() {

  angular.module('weather', [])

  .controller('forecast', ['$http', '$scope', function($http, $scope){

    var _this = this,
      default_city = 'New York, NY';
    
    $scope.item = [];

    // recall the existing city or display the default
    $scope.name = $scope.name || default_city;

    // holds the 48 conditions and their corresponding icons
    _this.conditions = [
      { "code": 0, "icon": "wi-tornado", "text": "tornado" },
      { "code": 1, "icon": "wi-storm-showers", "text": "tropical storm" },
      { "code": 2, "icon": "wi-hurricane", "text": "hurricane" },
      { "code": 3, "icon": "wi-thunderstorm", "text": "severe thunderstorms" },
      { "code": 4, "icon": "wi-day-sunny", "text": "thunderstorms" },
      { "code": 5, "icon": "wi-sleet", "text": "mixed rain and snow" },
      { "code": 6, "icon": "wi-sleet", "text": "mixed rain and sleet" },
      { "code": 7, "icon": "wi-sleet", "text": "mixed snow and sleet" },
      { "code": 8, "icon": "wi-rain-mix", "text": "freezing drizzle" },
      { "code": 9, "icon": "wi-rain", "text": "drizzle" },
      { "code": 10, "icon": "wi-rain-mix", "text": "freezing rain" },
      { "code": 11, "icon": "wi-showers", "text": "showers" },
      { "code": 12, "icon": "wi-showers", "text": "showers" },
      { "code": 13, "icon": "wi-snow", "text": "snow flurries" },
      { "code": 14, "icon": "wi-snow", "text": "light snow showers" },
      { "code": 15, "icon": "wi-snow", "text": "blowing snow" },
      { "code": 16, "icon": "wi-snow", "text": "snow" },
      { "code": 17, "icon": "wi-hail", "text": "hail" },
      { "code": 18, "icon": "wi-sleet", "text": "sleet" },
      { "code": 19, "icon": "wi-dust", "text": "dust" },
      { "code": 20, "icon": "wi-fog", "text": "foggy" },
      { "code": 21, "icon": "wi-day-haze", "text": "haze" },
      { "code": 22, "icon": "wi-smoke", "text": "smoky" },
      { "code": 23, "icon": "wi-day-windy", "text": "blustery" },
      { "code": 24, "icon": "wi-day-windy", "text": "windy" },
      { "code": 25, "icon": "wi-thermometer-exterior", "text": "cold" },
      { "code": 26, "icon": "wi-cloudy", "text": "cloudy" },
      { "code": 27, "icon": "wi-night-cloudy", "text": "mostly cloudy (night)" },
      { "code": 28, "icon": "wi-day-cloudy", "text": "mostly cloudy (day)" },
      { "code": 29, "icon": "wi-night-partly-cloudy", "text": "partly cloudy (night)" },
      { "code": 30, "icon": "wi-day-cloudy", "text": "partly cloudy (day)" },
      { "code": 31, "icon": "wi-night-clear", "text": "clear (night)" },
      { "code": 32, "icon": "wi-day-sunny", "text": "sunny" },
      { "code": 33, "icon": "", "text": "fair (night)" },
      { "code": 34, "icon": "", "text": "fair (day)" },
      { "code": 35, "icon": "wi-day-rain-mix", "text": "mixed rain and hail" },
      { "code": 36, "icon": "wi-hot", "text": "hot" },
      { "code": 37, "icon": "wi-thunderstorm", "text": "isolated thunderstorms" },
      { "code": 38, "icon": "wi-thunderstorm", "text": "scattered thunderstorms" },
      { "code": 39, "icon": "wi-thunderstorm", "text": "scattered thunderstorms" },
      { "code": 40, "icon": "wi-thunderstorm", "text": "scattered showers" },
      { "code": 41, "icon": "wi-snow", "text": "heavy snow" },
      { "code": 42, "icon": "wi-snow", "text": "scattered snow showers" },
      { "code": 43, "icon": "wi-snow", "text": "heavy snow" },
      { "code": 44, "icon": "wi-cloud", "text": "partly cloudy" },
      { "code": 45, "icon": "wi-storm-showers", "text": "thundershowers" },
      { "code": 46, "icon": "wi-snow", "text": "snow showers" },
      { "code": 47, "icon": "wi-thunderstorm", "text": "isolated thundershowers" },
      { "code": 3200, "icon": "wi-na", "text": "not available" }
     ]; 

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

      };

      $http.get('conditions.json').then(success, error);
    }

    /***
     *  this method is expected to set the forecast objects
     **/
    $scope.getWeather = function(city) {
      var success = function(response) {
        var data = response.data.query.results.channel;
        $scope.location = data.location;
        $scope.item = data.item;
      },
      error = function(response) {
      },
      url = "http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='"+city+"')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'";
      
      $http.get(url).then(success, error);

    };

    /***
     *  this method is expected to return the icon for the corresponding condition code
     *  from the codeToCondition map file
     **/
    $scope.getIcon = function(code) {
      var c = code || 48; // in conditiona array defined above, item 48 is 'not available';
      return _this.conditions[c].icon;
    };

    /***
     * load the condition code map
     * this maps the condition code returned from the api to the corresponding icon
     *
     *  *** mimetype for .json not configured on my local server so I included data above in variable definition above
     */ 
     //GetConditionMap(); 
    
    /***
     * load weather for the default city
     */
     $scope.getWeather($scope.name);

     
  }]);
})();