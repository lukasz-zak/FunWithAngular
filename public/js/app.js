'use strict';

angular.module('FunWithAngular.services', ['btford.socket-io']);

angular.module('FunWithAngular.directives', []);

angular.module('FunWithAngular', ['ui', 'LocalStorageModule', 'FunWithAngular.services', 'ui.bootstrap'])
  .config(function ($routeProvider, $locationProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'partials/chatLogin',
        controller: 'chatLoginCtrl'
      })
      .when('/chat', {
        templateUrl: 'partials/chatMain',
        controller: 'ChatCtrl',
        resolve: {
          authResolver: function($q, $location, $http, SocketConn){
            var defer = $q.defer();
            $http.get('/auth').success(function(data, status){
              console.log(data);
              console.log(status);
              if(data.isAuthenticated === true)
                defer.resolve();
              else{
                $location.path('/');
              }
            })
          }
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

    $rootScope.$watch(function () {
      return $location.path();
    }, function (newLocation, oldLocation) {
      if(oldLocation === '/' ||  oldLocation === ''){
        $http.get('/auth').success(function(data, status){
          if(data.isAuthenticated === true)
            $location.path('/chat');
        });
      } 
      //else if(oldLocation === '/chat' && newLocation === '/'){
      //  $location.path('/chat');
      }
    }, true);
  });