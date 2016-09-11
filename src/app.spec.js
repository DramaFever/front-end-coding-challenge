// testing controller
describe('The weather app', function() {
  var $httpBackend,
      $rootScope,
      createController;

  // Set up the module
  beforeEach(module('weather'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

  var createController = function() {
      return $controller('forecast', {'$scope' : $rootScope });
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
      $httpBackend.when('GET', '/conditions.json').respond(200, {});
        $httpBackend.when('GET', '/query.yahooapis.com/').respond(200, readJSON('./src/forecast.json'));

      var controller = createController();

      expect(controller.conditions).not.toBe(undefined);
      expect( controller.conditions.length ).toBe(0);


      expect(controller.conditions.length).toBe(0);
      expect(controller.conditions[1]).toBe(undefined);
    });

    it('should load all known conditions.', function(){
      $httpBackend.when('GET', '/conditions').respond(200, readJSON('./src/conditions.json'));
        $httpBackend.when('GET', '/query.yahooapis.com/').respond(200, readJSON('./src/forecast.json'));

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

      $httpBackend.when('GET', '/query.yahooapis.com/').respond(500, {});

      var controller = createController();

        $httpBackend.flush() ;

      expect($scope.item).toBe(undefined);
      expect($scope.location).toBe(undefined);

    });

    it('should load a weather forecast for a default location.', function() {

      $httpBackend.when('GET', '/query.yahooapis.com/').respond(200, readJSON('./src/forecast.json'));

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
      $httpBackend.when('GET', '/conditions/').respond(200, readJSON('./src/conditions.json'));
      $httpBackend.when('GET', '/query.yahooapis.com/').respond(readJSON('./src/forecast.json'));

      var controller = createController();

      $httpBackend.flush();
    });




    it('should provide an icon for the provided weather code.', function(){
      var icon = $scope.getIcon('29');
      expect(icon).toBe('wi-night-partly-cloudy');
    });
  });
});