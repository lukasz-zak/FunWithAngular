'use strict';

angular.module('FunWithAngular.services', ['btford.socket-io']);

angular.module('FunWithAngular.directives', []);

angular.module('FunWithAngular',
  ['ui', 'LocalStorageModule', 'FunWithAngular.services'])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/chatLogin',
        controller: 'chatLoginCtrl'
      })
      .when('/chat', {
        templateUrl: 'partials/chatMain',
        controller: 'ChatCtrl'
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
  }).run(function($rootScope, $location, SocketConn, localStorageService){
    console.log('AppRun!');

    $rootScope.$watch(function () {
      return $location.path();
    }, function (newLocation, oldLocation) {
      console.group('watchingInApp');
      var usrDataFromLS = JSON.parse(localStorageService.get('user'));
      console.log(newLocation, oldLocation);
      if(newLocation === '/chat' && usrDataFromLS !== null ){
          console.log('new location is /chat')
          console.log('usrDataFromLS: ', usrDataFromLS);
          if(SocketConn.getCookie('username') === usrDataFromLS.id){
            SocketConn.reconnectUser(usrDataFromLS);
            console.log("my name is: ", usrDataFromLS.userName);
          }else{
            $location.path('/');
          }
      }
      console.groupEnd('watchingInApp');
    }, true);
  });