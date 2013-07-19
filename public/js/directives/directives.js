'use strict';

angular.module('FunWithAngular.directives', [])

  .directive('user', ['$rootScope', function($rootScope){
    
    return {
      restrict : 'C',
      scope: false,
      link : function (scope, element, attrs) {   

        if(!angular.isUndefined(scope.$parent.$parent.usersList) 
            && scope.user.userName === $rootScope.me.userName)
            
          element.addClass('itsMe');
          
          
        scope.openPrvWindow = function(e){
          console.warn('Sorry. This feature isn\'t yet implemented!');
        };
        
      }
    }
  }])

  .directive('chatMessage', ['', function () {
    return {
      restrict: 'A',
      link: function (scope, iElement, iAttrs) {
        
      }
    };
  }])

  .directive('enableNotif', [function(){
    function checkNotificationPermission(){
      if(window.webkitNotifications !== undefined){
        if (window.webkitNotifications.checkPermission() === 0) { // 0 is PERMISSION_ALLOWED
          console.log("webkitNotifications permission not granded");
        } else {
          console.log("webkitNotifications request Permission");
          window.webkitNotifications.requestPermission();
        }
      }
    }

    return {
      link: function(scope, element, attrs){
        element[0].addEventListener('click', checkNotificationPermission)
      }
    }
	}]);