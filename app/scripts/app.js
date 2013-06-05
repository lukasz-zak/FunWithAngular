'use strict';

angular.module('FunWithAngular',
  ['ui', 'LocalStorageModule', 'btford.socket-io', 'FunWithAngular.services'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/chatLogin.html',
        controller: 'ChatCtrl'
      })
      .when('/chat', {
        templateUrl: 'views/chatMain.html',
        controller: 'ChatCtrl'
      })
      .when('/main',{
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
