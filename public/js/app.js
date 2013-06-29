'use strict';

angular.module('FunWithAngular.services', ['btford.socket-io']);

angular.module('FunWithAngular.directives', []);

angular.module('FunWithAngular', ['ui', 'LocalStorageModule', 'FunWithAngular.services', 'ui.bootstrap'])
  .config(function ($routeProvider, $locationProvider) {
      
    var authResolver = function(SocketConn, $location, $rootScope){
      var auth = SocketConn.isAuthenticated($location.path());
      auth.promise.then(function(data){
        $rootScope.me = data.user;
        SocketConn.fetchUserData(data.user);
        return auth.promise;
      })
    }

    $routeProvider
      .when('/', {
        templateUrl: 'partials/chatLogin',
        controller: 'chatLoginCtrl',
        resolve : {
          auth : authResolver
        }
      })
      .when('/chat', {
        templateUrl: 'partials/chatMain',
        controller: 'ChatCtrl',
        resolve: {
          auth : authResolver
        }
      })
      .when('/main',{
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/logout',{
        templateUrl: 'partials/main',
        controller: 'chatLogoutCtrl'
      })
      .otherwise({
        redirectTo: '/error'
      });
      $locationProvider.html5Mode(false);
  }).run(function($rootScope, $http, $location, SocketConn, localStorageService){
    console.log('AppRun!');
  });