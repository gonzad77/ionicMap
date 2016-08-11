angular.module('controllers', [])

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, NgMap, $ionicLoading, GooglePlacesService){
  // Central Park location
  $scope.latitude = 40.785091;
  $scope.longitude = -73.968285;

  // Google Places search
  $scope.search = { input: '' };
  $scope.predictions = [];

  // To properly init the google map with angular js
  $scope.init = function(map) {
    $scope.mymap = map;
    $scope.$apply();
  };

  var createMarker = function(place){
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: vmap.map,
      position: place.geometry.location
    });

    // google.maps.event.addListener(marker, 'click', function() {
    //   infowindow.setContent(place.name);
    //   infowindow.open(map, this);
    // });
  };

  var vmap = this;
  NgMap.getMap().then(function(map){
    // var options = {timeout: 10000, enableHighAccuracy: true};
    vmap.map = map;
    // $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    //   $scope.latitude = position.coords.latitude;
    //   $scope.longitude = position.coords.longitude;
    // })


  });

  $scope.customMarkers = [
          {address: "1600 pennsylvania ave, washington DC", "class": "customMarkers", "name": "marker1"},
          {address: "600 pennsylvania ave, washington DC",  "class": "customMarkers", "name": "marker2"},
        ];
  $scope.placeChanged = function() {
    vmap.place = this.getPlace();
    vmap.map.setCenter(vmap.place.geometry.location);
    $scope.searchMarker={"latitude": vmap.place.geometry.location.lat(),
                        "longitude": vmap.place.geometry.location.lng()}
  }

  $scope.centerOnCurrentPosition = function(){
    var options = {
      timeout: 10000,
      enableHighAccuracy: true
    };
    $ionicLoading.show({
      template: 'Getting current position ...'
    });
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      $ionicLoading.hide().then(function(){
        $scope.latitude = position.coords.latitude;
        $scope.longitude = position.coords.longitude;
      });
    });
  };

  $scope.getPlacePredictions = function(query){
    if(query !== "")
    {
      GooglePlacesService.getPlacePredictions(query)
      .then(function(predictions){
        $scope.predictions = predictions;
      });
    }else{
      $scope.predictions = [];
    }
  };

  $scope.selectSearchResult = function(result){
    $scope.search.input = result.description;
    $scope.predictions = [];

    // With this result we should find restaurants arround this place and then show them in the map
    // First we need to get LatLng from the place ID
    GooglePlacesService.getLatLng(result.place_id)
    .then(function(result_location){
      // Now we are able to search restaurants near this location
      // result_location.lat()
      // result_location.lng()
      // debugger;

      GooglePlacesService.getPlacesNearby(vmap.map, result_location)
      .then(function(nearby_places){
        // Create a location bound to center the map based on the results
        var bound = new google.maps.LatLngBounds();

        for (var i = 0; i < nearby_places.length; i++) {
          // debugger;
		      bound.extend(nearby_places[i].geometry.location);
		      createMarker(nearby_places[i]);
		    }

        // debugger;
        var neraby_places_bound_center = bound.getCenter();
        // console.log(bound.getCenter());

        // Center map based on the bound arround nearby places
        $scope.latitude = neraby_places_bound_center.lat();
        $scope.longitude = neraby_places_bound_center.lng();
      });
    });
  };




})

;
