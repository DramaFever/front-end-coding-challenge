var app = angular.module('weather', [])

.controller('forecast', ["$scope", "$http", function($scope, $http){
// $scope.hello = "testing";
  var default_city = 'New York, NY';

  // recall the existing city or display the default
  $scope.name = $scope.name || default_city;

  // holds the 48 conditions and their corresponding icons
 

  /***
   *  there are 48 different condition codes that the api can return
   *  this method makes those conditions and their corresponding icon mapping
   *  available to the rest of the controller
   **/
   // $scope.hello = "hi";
  $scope.conditions = 
    $http({
      method: 'GET',
      url: "http://localhost:3000/conditions.json"
    }).then(function successfulCallback(response) {
      $scope.conditions = response;
    }, function errorCallback(response) {
      if (status === 404) {
        window.alert('not found');
      } else {
        window.alert('unknown error');
      }
    });

  /***
   *  this method is expected to set the forecast objects
   **/
 
    $http({
      method: 'GET',
      url: "http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(2459115) where text='New York, NY')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"
    }).then(function successfulCallback(response) {
      $scope.forecasts = response.data.query.results.channel.item.forecast;
    }, function errorCallback(response) {
      if (status === 404) {
        window.alert('not found');
      } else {
        window.alert('unknown error');
      }
    });


 
}]);
