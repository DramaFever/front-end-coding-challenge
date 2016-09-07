angular.module('weather', [])

.controller('forecast', function ($http, $scope){

  const _this = this;
  var default_city = 'New York, NY';

  // recall the existing city or display the default
  $scope.name = $scope.name || default_city;

  // holds the 48 conditions and their corresponding icons
  _this.conditions = new Array(48);

  /***
   *  there are 48 different condition codes that the api can return
   *  this method makes those conditions and their corresponding icon mapping
   *  available to the rest of the controller
   **/
  $scope.getConditionMap = function() {
    $http.get('/conditions.json').success(function(data) {
      console.debug(data);
      $scope.conditions = data;
    }).error(function (data, status, headers, config) {
      console.error(data, status, headers, config);
        if(status == 404) {
          window.alert('Not Found');
        }else{
          window.alert('unknown error');
        }
        });
    }; 
  });

  /***
   *  this method is expected to set the forecast objects
   **/
  