angular.module('FunWithAngular.directives')
	.directive('enableNotif', function(){

		return function(scope, element, attrs){

			function checkNotificationPermission(){
			    if(window.webkitNotifications !== undefined){
			        if (window.webkitNotifications.checkPermission() === 0) { // 0 is PERMISSION_ALLOWED
			            console.log("webkitNotifications permission not granded");
			        } else {
			            window.webkitNotifications.requestPermission();
			        }
			    }
			}
		}
	});