'use strict';

angular.module('FunWithAngular.services')
 	.factory('SocketConn', function($timeout, $q, $http, $location, $rootScope, socket){
 		
 		var usersList,
 			newJoiner,
 			myUsrName,
 			amount,
 			getCookies;

 		socket.on('usersList', function(data){
 			usersList = data;
 			console.log('usersList: ', usersList);
 			//$rootScope.$apply();
 		})

 		socket.on('newUserJoin', function(data){
 			newJoiner = data.userName;
 			amount = data.amount;
 			//$rootScope.$apply();
 		})
 		
 		return {
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
						
						defer.resolve(result);
					} else{
						defer.reject('User name already used');
					}
				});
				return defer.promise;
			},
            
      isAuthenticated : function(destPath){
        var defer = $q.defer();
        var user;
        $http.get('/auth').success(function(data, status){
          if(data.isAuthenticated === true && destPath === '/chat'){
          	console.log("data: ", data);
          	user = data.user;
            defer.resolve(data)
          } else if(data.isAuthenticated === true && destPath === '/'){
            defer.reject(data)
            $location.path('/chat');
          } else if(data.isAuthenticated === false && destPath === '/chat'){
            defer.reject(data)
            $location.path('/');
          } else if(data.isAuthenticated === false && destPath === '/'){
            defer.resolve(data)
          }
        })
        
        return {
        	'promise' : defer.promise,
        	'user'	: user
        }
      },

 			logoutUser : function (id) {
 				console.log('emit for logout user');
 				//socket.emit('logoutUser', id);
 			},

 			getUsersAmount: function(){
 				return amount;
 			}, 

 			getUsers: function () {
 				return usersList;
 			},

 			getMyUsrName: function () {
 				console.log('getMyUsrName')
 				return myUsrName;
 			},

 			getNewJoiner : function(){
 				return newJoiner;
 			},

 			setMyUsrName: function (name) {
 				console.log('setUsrName' + name)
 				myUsrName = name;
 			},

 			fetchUserData: function(userData){
 				socket.emit('fetchUserData', userData);
 			}
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