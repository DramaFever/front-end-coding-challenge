// testing controller
describe('The weather app', function() {
  var $httpBackend,
      $scope;

  // Set up the module
  beforeEach(module('weather'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $scope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('forecast', {'$scope' : $scope });
    };
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('condition map', function(){
    beforeEach(function(){
    });

    it('should throw an error when the condition map cannot be loaded.', function(){
      $httpBackend.whenGET(/conditions/).respond(200, {});
        $httpBackend.whenGET(/query.yahooapis.com/).respond(200, readJSON('./src/forecast.json'));

      var controller = createController();

      expect(controller.conditions).not.toBe(undefined);
      expect( controller.conditions.length ).toBe(0);


      expect(controller.conditions.length).toBe(0);
      expect(controller.conditions[1]).toBe(undefined);
    });

    it('should load all known conditions.', function(){
      $httpBackend.whenGET(/conditions/).respond(200, readJSON('./src/conditions.json'));
        $httpBackend.whenGET(/query.yahooapis.com/).respond(200, readJSON('./src/forecast.json'));

      var controller = createController();

      expect(controller.conditions).not.toBe(undefined);
      expect(controller.conditions.length).toBe(0);

      $httpBackend.flush();

      expect(controller.conditions.length).toBe(49);
      expect(controller.conditions[1].code).toBe(1);
      expect(controller.conditions[1].icon).toBe('wi-storm-showers');
    });
  });

  describe('with condition map successfully loaded', function() {
    beforeEach(function(){
    });

    it('should gracefully handle a weather forecast that cannot be loaded.', function() {

      $httpBackend.whenGET(/query.yahooapis.com/).respond(500, {});

      var controller = createController();

        $httpBackend.flush() ;

      expect($scope.item).toBe(undefined);
      expect($scope.location).toBe(undefined);

    });

    it('should load a weather forecast for a default location.', function() {

      $httpBackend.whenGET(/query.yahooapis.com/).respond(200, readJSON('./src/forecast.json'));

      var controller = createController();

      expect($scope.item).toBe(undefined);
      expect($scope.location).toBe(undefined);

      $httpBackend.flush();

      expect( $scope.item ).not.toBe(undefined);
      expect($scope.location).not.toBe(undefined);

      expect($scope.location.city).toBe('New York');
      // expect($scope.item.condition.code).toBe('29');

    });
  });

  describe('with condition map and forecast successfully loaded', function() {
    beforeEach(function(){
      $httpBackend.whenGET(/conditions/).respond(200, readJSON('./src/conditions.json'));
      $httpBackend.whenGET(/query.yahooapis.com/).respond(readJSON('./src/forecast.json'));

      var controller = createController();

      $httpBackend.flush();
    });




    it('should provide an icon for the provided weather code.', function(){
      var icon = $scope.getIcon('29');
      expect(icon).toBe('wi-night-partly-cloudy');
    });
  });
});