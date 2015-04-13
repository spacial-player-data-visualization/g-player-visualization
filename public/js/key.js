var app = angular.module('Keys', []);

app.factory('keys', function keyFactory($http) {
    return {

        // GET
        get: function(callback) {

            $http.get("/api/keys")

            .success(function(keys) {
                    callback(keys);
                })
                .error(function() {
                    alert("API Error in getting key");
                })
        },

        // DELETE
        delete: function(index, callback) {
            $http.delete('/api/keys/' + index)
                .success(function(keys) {
                    callback(keys);
                })
                .error(function() {
                    alert("API Error in removing key");
                })
        },

        // PUT
        put: function(id, key, callback) {
        	console.log(key);
            $http.put('/api/keys/' + id, key)
                .success(function(keys) {
                    callback(keys);
                })
                .error(function() {
                    alert("API Error in updating key");
                })
        },

        // POST
        post: function(key, callback) {

        	console.log(key);

            // Convert array to object
            // (Makes Node happier).
            var key = {
                game: key['game'],
                type: key['type'],
                actions: key['actions'],
                columns: key['columns']
            }
            console.log(key);

            $http.post('/api/keys', key)
                .success(function(keys) {
                    callback(keys)
                })
                .error(function() {
                    alert("API Error in adding key");
                })
        }
    }
});
app.controller('KeysController', function($scope, $http, $filter, keys) {

    // Local variable for keys list
    $scope.keys = [];

    // Local variable for the current
    // active key (edit or new)
    $scope.key = {};

    // The last selected ID.
    // null, equals a key is being created
    $scope.selectedKeyId = -1;

    // initialize key list from server
    keys.get(function(keys) {
        $scope.keys = keys;
    });

    // to string helper
    $scope.stringify = function(string) {
    	return JSON.stringify(string);
    }

    /*****************
            UI 
     *****************/

    // Open edit modal
    $scope.openEdit = function(index) {

        // Selected ID
        $scope.selectedKeyId = index;

        // Update Model Title
        $scope.activeTitle = "Edit Key";

        // Copy Key to memory
        $scope.key = angular.copy($scope.keys[index]);

        $("#editModal").modal()
    }

    // Open create modal
    $scope.openNew = function() {

        $scope.selectedKeyId = -1;

        $scope.activeTitle = "Create New Key";

        $scope.key = [];

        $("#editModal").modal()
    }

    // Save a key
    $scope.save = function(key) {

        var id = $scope.selectedKeyId;

        // Edit
        if (id > -1) {

            // Update existing key
            $scope.update(id, key);

            // New
        } else {
        	// key.actions = JSON.parse(key.actions)
        	// key.columns = JSON.parse(key.columns)
            // Add new key
            $scope.add(key)
        }

        // Close modal when done
        $("#editModal").modal("hide");
        keys.get(function(keys) {
            $scope.keys = keys;
        });

    }

    /*****************
           CRUD
     *****************/

    $scope.delete = function(index) {
        bootbox.confirm('are you sure', function(result) {
            if (result) {
                keys.delete($scope.keys[index]._id, function() {
                    keys.get(function(keys) {
                        $scope.keys = keys;
                    });
                })
            } else {
                return
            }
        });
    }

    $scope.update = function(id, key) {
        console.log(key.actions);
        console.log(key.columns);
        keys.put($scope.keys[id]._id, key, function() {
            keys.get(function(keys) {
                $scope.keys = keys;
            });
        })
    }

    $scope.add = function(key) {
        keys.post(key, function(keys) {
            $scope.keys = keys;
        });
    }

});