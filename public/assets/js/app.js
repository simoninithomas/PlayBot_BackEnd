/************************************************************************************************************************
 ************************************************************************************************************************
 ************************************************************************************************************************
 *
 *                                                         app.js
 * @Author : SIMONINI Thomas, 2016 simonini_thomas@outlook.fr
 ************************************************************************************************************************
 ************************************************************************************************************************
 ************************************************************************************************************************/
angular.module('app', ['ngRoute',  'ngCookies', 'ngResource', 'ngSanitize', 'toaster', 'ngAnimate','ngFileUpload'])

    .config(['$routeProvider', '$httpProvider', '$locationProvider', function($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "templates/login.html",
                controller: "loginController",
                controllerAs: 'vm'
            })
            .when("/register", {
                templateUrl: "templates/register.html",
                controller: "registerController",
                controllerAs: 'vm'
            })
            .when("/home", {
                templateUrl: "templates/home.html",
                controller: "homeController",
                controllerAs: 'vm'
            })
            .when("/crawl", {
                templateUrl: "templates/crawl.html",
                controller: "crawlController",
                controllerAs: 'vm'
            })
            .when("/game-list-android", {
                templateUrl: "templates/game-list-android.html",
                controller: "listGameController",
                resolve: {
                    games: function (Games) {
                        return Games.getGamesAndroid();
                    }
                }
            })
            .when("/game-list-ios", {
                templateUrl: "templates/game-list-ios.html",
                controller: "listGameController",
                resolve: {
                    games: function (Games) {
                        return Games.getGamesIos();
                    }
                }
            })
            .when("/profile", {
                templateUrl: "templates/profile.html",
                controller: "profileController"
            })
            .when("/add-game-android", {
                templateUrl: "templates/addGameAndroid.html",
                controller: "addGameController"
            })
            .when("/add-game-ios", {
                templateUrl: "templates/addGameIos.html",
                controller: "addGameController"
            })








    }])

    .run(function ($rootScope, $location, $route, authentication) {
            console.log('RUN RUN');
            $rootScope.$on('$routeChangeStart',
                function (event, next, current) {

                    if (authentication.isLoggedIn() === false) {
                        console.log('isLoggedin false');
                        $location.path('/');
                    }
                });


        })

    // Use AngularJS services to make requests to the API server
    .service("Games", function($http, toaster){

        this.addGameAndroid = function(game){
            return $http.post("/api/v1/games/android", game).
                then(function(response) {
                console.log(response);
                toaster.pop({type: 'success', title: "Success", body:"The game has been added to the DB"})
                    return response;
                }, function(response) {
                toaster.error("Error, we cannot add this game.");
                });
            }


        this.editGameAndroid = function(game_id, game) {


            var url = "/api/v1/games/android/" + game_id;
            return $http.put(url, game).
            then(function(response) {
                console.log('Edit');
                toaster.pop({type: 'success', title: "Success", body:"The game has been edited"});
                return response;
            }, function(response) {
                toaster.error("Error, we cannot edit it.");
                console.log(response);
            });
        }

        this.addGameIos = function(game){
            return $http.post("/api/v1/games/ios", game).
            then(function(response) {
                console.log(response);
                toaster.pop({type: 'success', title: "Success", body:"The game has been added to the DB"})
                return response;
            }, function(response) {
                toaster.error("Error, we cannot add this game.");
            });
        }


        this.getGamesAndroid = function(){

            return $http.get("/api/v1/games/android/all")
                .then(function(response){
                        console.log(response);
                        return response

                    },
                    function(response){
                        toaster.error("Error, we cannot retrieving games.");
                    })
        }
        this.getGamesIos = function(){

            return $http.get("/api/v1/games/ios/all")
                .then(function(response){
                        console.log(response);
                        return response

                    },
                    function(response){
                        toaster.error("Error, we cannot retrieving games.");
                    })
        }

        this.getOneGameAndroid = function(game_id){
            return $http.get("/api/v1/games/android/"+ game_id)

                .then(function(response){

                        console.log("This is response", response);
                        gameEdit = response;
                        console.log("This is gameEdit server", gameEdit);
                        return gameEdit

                    },
                    function(response){
                        toaster.error("Error, we cannot retrieving this game.");
                    })
        }
        this.getOneGameIos = function(game_id){
            return $http.get("/api/v1/games/ios/"+ game_id)

                .then(function(response){

                        console.log("This is response", response);
                        gameEdit = response;
                        console.log("This is gameEdit server", gameEdit);
                        return gameEdit

                    },
                    function(response){
                        toaster.error("Error, we cannot retrieving this game.");
                    })
        }
        this.deleteGameAndroid = function(game_id){
            console.log('Lets delete');
            console.log('Game_id = ', game_id);
            return $http.delete("/api/v1/games/android/"+ game_id)
                .then(function(response){
                        console.log(response);
                        toaster.pop({type: 'success', title: "Success", body:"The game has been deleted"})
                        return response

                    },
                    function(response){
                        toaster.error("Error, we cannot delete it.");
                    })
        }
        this.deleteGameIos = function(game_id){
            console.log('Lets delete');
            console.log('Game_id = ', game_id);
            return $http.delete("/api/v1/games/Ios/"+ game_id)
                .then(function(response){
                        console.log(response);
                        toaster.pop({type: 'success', title: "Success", body:"The game has been deleted"})
                        return response

                    },
                    function(response){
                        toaster.error("Error, we cannot delete it.");
                    })
        }

        this.editGameIos = function(game_id, game) {


            var url = "/api/v1/games/ios/" + game_id;
            return $http.put(url, game).
            then(function(response) {
                console.log('Edit');
                toaster.pop({type: 'success', title: "Success", body:"The game has been edited"});
                return response;
            }, function(response) {
                toaster.error("Error, we cannot edit it.");
                console.log(response);
            });
        }
    })


    .service('authentication', ['$http', '$window', function authentication ($http, $window) {

    var saveToken = function (token) {
        $window.localStorage['mean-token'] = token;
    };

    var getToken = function () {
        return $window.localStorage['mean-token'];

    };

    var isLoggedIn = function() {
        var token = getToken();
        var payload;

        if(token){
            payload = token.split('.')[1];
            payload = $window.atob(payload);
            payload = JSON.parse(payload);

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    var currentUser = function() {
        if(isLoggedIn()){
            console.log('Yeah');
            var token = getToken();
            var payload = token.split('.')[1];
            payload = $window.atob(payload);
            payload = JSON.parse(payload);
            return {
                email : payload.email,
                name : payload.name
            };
        }
    };

    register = function(user) {
        return $http.post('/api/v1/register', user).success(function(data){
            saveToken(data.token);
        });
    };

    login = function(user) {
        return $http.post('/api/v1/login', user).success(function(data) {
            saveToken(data.token);
            console.log('data.token', data.token)
        });
    };

    logout = function() {
        $window.localStorage.removeItem('mean-token');


    };

    return {
        currentUser : currentUser,
        saveToken : saveToken,
        getToken : getToken,
        isLoggedIn : isLoggedIn,
        register : register,
        login : login,
        logout : logout
    };
}])

    .service('meanData', ['$http', 'authentication', function meanData ($http, authentication) {


    var getProfile = function () {
        return $http.get('/api/v1/profile', {
            headers: {
                Authorization: 'Bearer '+ authentication.getToken()

            }
        });
    };

    return {
        getProfile : getProfile
    };
}])






.controller("homeController", function($scope, authentication){
    $scope.doLogOut = function(){
        console.log('Do logout');
        logout();

    }
})


.controller("registerController", function registerCtrl($location, authentication) {
        var vm = this;

        vm.credentials = {
            name : "",
            email : "",
            password : ""
        };

        vm.onSubmit = function () {
            authentication
                .register(vm.credentials)
                .error(function(err){
                    alert(err);
                    console.log(err);
                })
                .then(function(){
                    $location.path('/');
                });
        };
    })

    .controller('loginController', function loginCtrl($location, authentication) {
    var vm = this;

    vm.credentials = {
        email : "",
        password : ""
    };

    vm.onSubmit = function () {
        console.log('Submit has been clicked')
        authentication
            .login(vm.credentials)
            .error(function(err){
                alert(err);
            })
            .then(function(){
                console.log('Successful logged');
                $location.path('/home');
            });
    };

})



    .controller("addGameController",  ['$scope', 'toaster', 'Games', 'Upload', function($scope, toaster, Game, Upload) {

        $scope.addGameAndroid = function(game) {

            Game.addGameAndroid(game);
        }
        $scope.addGameIos = function(game) {

            Game.addGameIos(game);
        }



    }])
    .controller("listGameController", ['games','$scope', 'toaster', 'Games', function(games, $scope, toaster, Game, gameEdit) {
        $scope.editMode = true;
        $scope.games = games.data;
        $scope.games._id = games.data._id;

        $scope.deleteGameAndroid = function(game_id) {
            Game.deleteGameAndroid(game_id);
        }

        $scope.deleteGameIos = function(game_id) {
            Game.deleteGameIos(game_id);
        }

        $scope.toggleEditAndroid = function(game) {
            $scope.editMode = false;
            $scope.game = game;
            $scope.game.gameId = game._id;
            console.log("Toggle game id",$scope.gameId);
        }

        $scope.toggleEditIos = function(game) {
            $scope.editMode = false;
            $scope.game = game;
            $scope.game.gameId = game._id;
            console.log("Toggle game id",$scope.gameId);
        }

        $scope.editGameAndroid = function(game_id, game) {
            console.log('gameId', game_id);
            console.log("edit game android", game_id);
            Game.editGameAndroid(game_id, game);
        }

        $scope.editGameIos = function(game_id, game) {
            console.log('gameId', game_id);
            console.log("edit game ios", game_id);
            Game.editGameIos(game_id, game);
        }
    }])

    .controller('profileController',['$location', 'meanData', function profileCtrl($location, meanData) {
    var vm = this;

    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            console.log('SUCCESS')
        })
        .error(function (e) {
            console.log(e);
        });
}])


    .factory('authInterceptor', function($location, $q, $window) {


        return {
            request: function(config) {
                config.headers = config.headers || {};

                config.headers.Authorization = 'Bearer ' + $window.localStorage['mean-token'];
                console.log(' config.headers.Authorization',  config.headers.Authorization)

                return config;
            }
        };
    })

    .config(function($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    })

