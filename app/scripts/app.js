'use strict';

angular.module('FunWithAngular',
  ['ui', 'LocalStorageModule', 'btford.socket-io', 'FunWithAngular.services'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/chat', {
        templateUrl: 'views/chatMain.html',
        controller: 'ChatCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
