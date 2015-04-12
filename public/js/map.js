var app = angular.module('Maps', []);

app.factory('maps', function mapFactory($http) {
    return {

        // GET
        get: function(callback) {

            $http.get("/api/maps")

            .success(function(maps) {
                    callback(maps);
                })
                .error(function() {
                    alert("API Error in getting map");
                })
        },

        // DELETE
        delete: function(index, callback) {
            $http.delete('/api/maps/' + index)
                .success(function(maps) {
                    callback(maps);
                })
                .error(function() {
                    alert("API Error in removing map");
                })
        },

        // PUT
        put: function(id, map, callback) {
            $http.put('/api/maps/' + id, map)
                .success(function(maps) {
                    callback(maps);
                })
                .error(function() {
                    alert("API Error in updating map");
                })
        },

        // POST
        post: function(map, callback) {

            // Convert array to object
            // (Makes Node happier).
            var map = {
                name: map['name'],
                game: map['game'],
                imageURL: map['imageURL'],
                top: map['top'],
                bottom: map['bottom'],
                left: map['left'],
                right: map['right'],
            }

            $http.post('/api/maps', map)
                .success(function(maps) {
                    callback(maps)
                })
                .error(function() {
                    alert("API Error in adding map");
                })
        }
    }
});
app.controller('MapsController', function($scope, $http, $filter, maps) {

    // Local variable for map list
    $scope.maps = [];

    // Local variable for the current
    // active map (edit or new)
    $scope.map = {};

    // The last selected ID.
    // null, equals a map is being created
    $scope.selectedMapId = -1;

    // initialize map list from server
    maps.get(function(maps) {
        $scope.maps = maps;
    });

    /*****************
            UI 
     *****************/

    // Open edit modal
    $scope.openEdit = function(index) {

        // Selected ID
        $scope.selectedMapId = index;

        // Update Model Title
        $scope.activeTitle = "Edit Map";

        // Copy Map to memory
        $scope.map = angular.copy($scope.maps[index]);

        $("#editModal").modal()
    }

    // Open create modal
    $scope.openNew = function() {

        $scope.selectedMapId = -1;

        $scope.activeTitle = "Create New Map";

        $scope.map = [];

        $("#editModal").modal()
    }

    // Save a map
    $scope.save = function(map) {

        var id = $scope.selectedMapId;

        // Edit
        if (id > -1) {

            // Update existing map
            $scope.update(id, map);

            // New
        } else {

            // Add new map
            $scope.add(map)
        }

        // Close modal when done
        $("#editModal").modal("hide");
        maps.get(function(maps) {
            $scope.maps = maps;
        });

    }

    /*****************
           CRUD
     *****************/

    $scope.delete = function(index) {
        bootbox.confirm('are you sure', function(result) {
            if (result) {
                maps.delete($scope.maps[index]._id, function() {
                    maps.get(function(maps) {
                        $scope.maps = maps;
                    });
                })
            } else {
                return
            }
        });
    }

    $scope.update = function(id, map) {
        maps.put($scope.maps[id]._id, map, function() {
            maps.get(function(maps) {
                $scope.maps = maps;
            });
        })
    }

    $scope.add = function(map) {
        maps.post(map, function(maps) {
            $scope.maps = maps;
        });
    }

});