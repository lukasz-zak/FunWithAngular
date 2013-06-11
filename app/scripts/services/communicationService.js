'use strict';

angular.module('FunWithAngular.services')
 	.factory('SocketConn', function($timeout, $q, $rootScope, socket, localStorageService, $location){
		var socket = io.connect('http://localhost:9001/');

 		var usersList,
 			newJoiner,
 			myUsrName,
 			amount,
 			getCookies;

 		socket.on('usersList', function(data){
 			usersList = data;
 			console.log('usersList: ', usersList);
 			$rootScope.$apply();
 		})

 		socket.on('newUserJoin', function(data){
 			newJoiner = data.userName;
 			localStorageService.add('user', JSON.stringify(data));
 			setCookieForNextHour(data.id)
 			amount = data.amount;
 			$rootScope.$apply();
 		})


 		socket.on('error', function(error){
 			if(error.userNameInUse && error.userNameInUse === true){
 				isAnyError = true;
 			}
 		});

		getCookies = function() {
	        var c = document.cookie, v = 0, cookies = {};
	        if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
	            c = RegExp.$1;
	            v = 1;
	        }
	        if (v === 0) {
	            c.split(/[,;]/).map(function(cookie) {
	                var parts = cookie.split(/=/, 2),
	                    name = decodeURIComponent(parts[0].trimLeft()),
	                    value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
	                cookies[name] = value;
	            });
	        } else {
	            c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1) {
	                var name = $0,
	                    value = $1.charAt(0) === '"'
	                              ? $1.substr(1, -1).replace(/\\(.)/g, "$1")
	                              : $1;
	                cookies[name] = value;
	            });
	        }
	        return cookies;
	    };

	    var setCookieForNextHour = function(data){
	        var now = new Date();
	        var time = now.getTime();
	        time += 3600 * 1000;
	        now.setTime(time);
	        document.cookie = 
	            'username=' + data + 
	            '; expires=' + now.toGMTString() + 
	            '; path=/';
	    };

 		return {
		    getCookie : function(name) {
		        return getCookies()[name];
		    },

			addNewUser: function(usrName){
				console.log('emit add new user');

				var result = {
					userName: '',
					success: false
				},
				defer = $q.defer();

				socket.emit('addNewUser', usrName, function(response){
					if (response) {
						result.success = true;
						result.userName = usrName;
						
						$rootScope.$apply(defer.resolve(result))
					} else{
						defer.reject();
					}
				});
				return defer.promise;
			},

 			reconnectUser : function (usrData) {
 				console.log('emit for reconnectUser');
 				socket.emit('reconnectUser', usrData);
 				myUsrName = usrData.userName;
 			},

 			logoutUser : function (id) {
 				console.log('emit for logout user');
 				//socket.emit('logoutUser', id);
 				socket.removeAllListeners();
 			},

 			getUsersAmount: function(){
 				return amount;
 			}, 

 			getUsers: function () {
 				return usersList;
 			},

 			getMyUsrName: function () {
 				return myUsrName;
 			},

 			getNewJoiner : function(){
 				return newJoiner;
 			},
 		}

 		//Socket listeneres
	  	//=============================================

	 //  	socket.on('disconnect', function(){
		//     console.log('disconnected !!')
		//     if(myUserName && myUserName.length > 0) {
		//         socket.emit('set_username', myUserName);
		//     }
		// });

		// socket.on('userJoined', function(msg) {
	 //        appendNewUser(msg.userName);
	 //        setUsersAmount(msg.amount);
	 //    });

	 //    socket.on('userLeft', function(msg) {
	 //        handleUserLeft(msg);
	 //    });

	 //    socket.on('message', function(msg) {
	 //        appendNewMessage(msg);
	 //    });

	 //    socket.on('welcome', function(msg) {
	 //        $scope.userName = "Hello " + msg.userName;
	 //        $('form').hide();
	 //        $('.msgWindow').removeClass('hidden');
	        
	 //        setFeedback("Username available. You can begin chatting.", 'success');
	        
	 //        setCurrentUsers(msg.currentUsers);
	 //        enableUsernameField(false);
	 //    });

	 //    socket.on('error', function(msg) {
	 //        if (msg.userNameInUse) {
	 //            setFeedback("Username already in use. Try another name.", 'error');
	 //            $('button#startChat').text('Start');
	 //        }
	 //    });

	});